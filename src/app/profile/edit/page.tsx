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
import { prisma } from "@/lib/prisma";
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
    <div className="mx-auto max-w-3xl px-4">
      <div className="rounded-2xl bg-gray-900 shadow-lg overflow-hidden ring-1 ring-gray-800">
        <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-sky-600 to-violet-600 text-white">
          <label
            className="relative flex items-center gap-4 cursor-pointer transform transition-transform duration-200 hover:scale-[1.03] focus:outline-none"
            htmlFor="image"
            title="Click to edit image URL"
          >
            <Image
              src={avatarSrc}
              alt={`${profile.name ?? "profile"} avatar`}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full ring-2 ring-white object-cover shadow-sm transition-shadow duration-200 hover:shadow-lg"
              unoptimized
            />
            <span className="absolute bottom-0 right-0 -mb-1 -mr-1 inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/8 text-xs font-medium backdrop-blur-sm">
              ✎
            </span>
          </label>

          <div className="flex-1 min-w-0">
            <form action={updateProfile} className="flex flex-col gap-2">
              <input type="hidden" name="userId" value={profile.id} />
              <div className="flex items-baseline gap-4">
                <input
                  name="name"
                  aria-label="Full name"
                  defaultValue={profile.name ?? ""}
                  placeholder="Your name"
                  autoComplete="name"
                  className="min-w-0 text-xl font-semibold bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-0 text-white placeholder-white/70 transition-colors duration-150"
                />
                <div className="text-sm text-white/90">
                  · {profile.role ?? "user"}
                </div>
                <div className="ml-auto text-xs text-white/80">
                  ID: {profile.id}
                </div>
              </div>

              <div className="mt-1 flex items-center gap-3">
                <input
                  aria-label="Email"
                  name="email"
                  type="email"
                  defaultValue={profile.email ?? ""}
                  readOnly
                  autoComplete="email"
                  className="text-sm bg-white/8 px-3 py-1 rounded-full text-white/90 border border-white/8 shadow-sm"
                />
                <div className="text-sm text-white/80">
                  Joined{" "}
                  <span className="font-medium">
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>

              {/* Hidden image input is part of the same form so clicking avatar focuses here */}
              <input
                id="image"
                name="image"
                defaultValue={profile.image ?? ""}
                placeholder="https://.../avatar.jpg"
                className="sr-only"
              />
            </form>
          </div>
        </div>

        <div className="p-6">
          <form action={updateProfile} className="space-y-6">
            <input type="hidden" name="userId" value={profile.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-300">Full name</span>
                <input
                  name="name"
                  defaultValue={profile.name ?? ""}
                  placeholder="Full name"
                  autoComplete="name"
                  className="mt-1 px-4 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-100 transition-shadow duration-150 shadow-sm hover:shadow"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-300">Email</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={profile.email ?? ""}
                  readOnly
                  className="mt-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-300">Phone (optional)</span>
                <input
                  name="phone"
                  defaultValue={""}
                  placeholder="Phone number"
                  inputMode="tel"
                  className="mt-1 px-4 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-100 transition duration-150"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Not available for now due to DB (will be added later)
                </p>
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-300">Image URL</span>
                <input
                  name="image"
                  defaultValue={profile.image ?? ""}
                  placeholder="https://.../avatar.jpg"
                  className="mt-1 px-4 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-100 transition-colors duration-150"
                />
              </label>
            </div>

            <label className="flex flex-col">
              <span className="text-sm text-gray-300">Bio</span>
              <textarea
                name="bio"
                defaultValue={""}
                placeholder="A short bio (optional)"
                rows={3}
                className="mt-1 px-4 py-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-100 transition-shadow duration-150 bg-gray-800"
              />
              <p className="mt-1 text-xs text-gray-400">
                Not available for now due to DB (will be added later)
              </p>
            </label>

            <fieldset className="rounded-md border border-gray-700 p-4">
              <legend className="text-sm font-medium text-gray-200">
                Address (optional)
              </legend>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  name="addressLine1"
                  defaultValue={address?.line1 ?? ""}
                  placeholder="Address line 1"
                  className="px-3 py-2 rounded-lg border border-gray-700 text-gray-100 bg-gray-800 focus:ring-2 focus:ring-sky-500 transition duration-150"
                />
                <input
                  name="addressLine2"
                  defaultValue={address?.line2 ?? ""}
                  placeholder="Address line 2"
                  className="px-3 py-2 rounded-lg border border-gray-700 text-gray-100 bg-gray-800 focus:ring-2 focus:ring-sky-500 transition duration-150"
                />
                <input
                  name="city"
                  defaultValue={address?.city ?? ""}
                  placeholder="City"
                  className="px-3 py-2 rounded-lg border border-gray-700 text-gray-100 bg-gray-800 focus:ring-2 focus:ring-sky-500 transition duration-150"
                />
                <input
                  name="postalCode"
                  defaultValue={address?.postalCode ?? ""}
                  placeholder="Postal code"
                  className="px-3 py-2 rounded-lg border border-gray-700 text-gray-100 bg-gray-800 focus:ring-2 focus:ring-sky-500 transition duration-150"
                />
                <input
                  name="country"
                  defaultValue={address?.country ?? ""}
                  placeholder="Country"
                  className="px-3 py-2 rounded-lg border border-gray-700 col-span-1 sm:col-span-2 text-gray-100 bg-gray-800 focus:ring-2 focus:ring-sky-500 transition duration-150"
                />
              </div>
            </fieldset>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Inline edits — click Save to persist changes.
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/profile"
                  className="text-sm text-gray-300 hover:text-gray-100 rounded-md px-2 py-1 transition-colors duration-150"
                >
                  Cancel
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
  );
}
