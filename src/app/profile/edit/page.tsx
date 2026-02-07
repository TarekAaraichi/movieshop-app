/**
 * Profile edit page
 * Server page that renders the profile editor and save controls.
 */

// Profile edit page (server component)
// - Requires a signed-in session. Fetches the user's profile and address
//   server-side and renders an editable form that calls `updateProfile`
//   server action to persist changes.
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SaveButton } from "@/components";
import { updateProfile } from "@/server/actions/usersActions";

type ProfileView = {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  role: string | null;
};

import { PageWrapper } from "@/components/PageThemeContext";

export default async function Page() {
  // require a signed-in session and fetch the user's profile
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (err) {
    // If the auth library fails, treat as not found / unauthorized for this page
    console.error("Failed to get session for profile edit page:", err);
    notFound();
  }

  if (!session || !session.user) {
    // no session -> 404 / redirect handled by caller; show notFound to match previous behavior
    notFound();
  }

  const userId = session.user.id as string | undefined;
  if (!userId) notFound();

  let profile: ProfileView | null = null;
  try {
    profile = (await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    })) as ProfileView | null;
  } catch (err) {
    console.error("Error fetching profile for user", userId, err);
    // avoid leaking implementation details to users; show 404 to match previous behavior
    notFound();
  }

  if (!profile) notFound();

  // fetch the user's address if present so the client editor can prefill it
  let address = null;
  try {
    address = await prisma.address.findFirst({ where: { userId: profile.id } });
  } catch (err) {
    console.error("Failed to fetch user address for profile edit", err);
  }

  // Avatar source logic:
  // - Prefer user-provided image
  // - Otherwise generate an identicon from DiceBear (new API). Old endpoint `https://avatars.dicebear.com/api/...` is deprecated
  //   and returns an in-image warning banner (what you're seeing). Updated pattern:
  //   https://api.dicebear.com/7.x/identicon/svg?seed=<seed>
  // - Keep SVG (sharp at any size). Using `unoptimized` until remotePatterns added to next.config.
  const avatarSrc =
    profile.image &&
    typeof profile.image === "string" &&
    profile.image.length > 0
      ? profile.image
      : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
          profile.id,
        )}`;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Edit Profile
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Update your account details and address.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-md p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image
                  src={avatarSrc}
                  alt={profile.name ?? "profile avatar"}
                  width={128}
                  height={128}
                  className="rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                  unoptimized
                />
                <label
                  htmlFor="image"
                  className="absolute bottom-0 right-0 cursor-pointer bg-white/80 dark:bg-neutral-800 rounded-full p-1 border border-neutral-300 dark:border-neutral-700"
                >
                  <span className="text-xs">✎</span>
                </label>
              </div>
              <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                <input
                  name="name"
                  defaultValue={profile.name ?? ""}
                  placeholder="Full name"
                  autoComplete="name"
                  className="bg-transparent text-center font-bold text-xl outline-none border-none focus:ring-0 text-neutral-800 dark:text-white"
                  form="profile-edit-form"
                />
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                <input
                  name="email"
                  type="email"
                  defaultValue={profile.email ?? ""}
                  readOnly
                  className="bg-transparent text-center text-sm outline-none border-none focus:ring-0 text-neutral-500 dark:text-neutral-400"
                  form="profile-edit-form"
                />
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <form
              id="profile-edit-form"
              action={updateProfile}
              className="space-y-6"
            >
              <input type="hidden" name="userId" value={profile.id} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    Phone (optional)
                  </span>
                  <input
                    name="phone"
                    defaultValue={""}
                    placeholder="Phone number"
                    inputMode="tel"
                    className="mt-1 px-4 py-2 rounded-lg border bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-gray-100 transition duration-150"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Not available for now due to DB (will be added later)
                  </p>
                </label>

                <label className="flex flex-col">
                  <span className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    Image URL
                  </span>
                  <input
                    id="image"
                    name="image"
                    defaultValue={profile.image ?? ""}
                    placeholder="https://.../avatar.jpg"
                    className="mt-1 px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-gray-100 transition-colors duration-150"
                  />
                </label>
              </div>

              <label className="flex flex-col">
                <span className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  Bio
                </span>
                <textarea
                  name="bio"
                  defaultValue={""}
                  placeholder="A short bio (optional)"
                  rows={3}
                  className="mt-1 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-gray-100 transition-shadow duration-150 bg-white dark:bg-neutral-800"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Not available for now due to DB (will be added later)
                </p>
              </label>

              <fieldset className="rounded-md border border-neutral-300 dark:border-neutral-700 p-4">
                <legend className="px-2 text-sm text-neutral-500 dark:text-neutral-400">
                  Address (optional)
                </legend>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    name="addressLine1"
                    defaultValue={address?.line1 ?? ""}
                    placeholder="Address line 1"
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-sky-500 transition duration-150"
                  />
                  <input
                    name="addressLine2"
                    defaultValue={address?.line2 ?? ""}
                    placeholder="Address line 2"
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-sky-500 transition duration-150"
                  />
                  <input
                    name="city"
                    defaultValue={address?.city ?? ""}
                    placeholder="City"
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-sky-500 transition duration-150"
                  />
                  <input
                    name="postalCode"
                    defaultValue={address?.postalCode ?? ""}
                    placeholder="Postal code"
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-sky-500 transition duration-150"
                  />
                  <input
                    name="country"
                    defaultValue={address?.country ?? ""}
                    placeholder="Country"
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 col-span-1 sm:col-span-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-sky-500 transition duration-150"
                  />
                </div>
              </fieldset>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Inline edits — click Save to persist changes.
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/profile"
                    aria-label="Cancel and return to profile"
                    className="inline-flex items-center gap-2 text-sm rounded-md px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors duration-150"
                  >
                    <span className="text-xs">✕</span>
                    <span>Cancel</span>
                  </a>
                  <div className="flex items-center">
                    <div className="rounded-md shadow-sm hover:shadow-md transition-shadow duration-150">
                      <SaveButton label="Save" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
