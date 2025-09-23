import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) {
    // no session -> 404 / redirect handled by caller; show notFound to match previous behavior
    notFound();
  }

  const userId = session.user.id as string | undefined;
  if (!userId) notFound();

  const profile = (await prisma.user.findUnique({
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

  if (!profile) notFound();

  const avatarSrc =
    profile.image ||
    `https://avatars.dicebear.com/api/identicon/${encodeURIComponent(
      profile.id
    )}.svg`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white shadow-md overflow-hidden">
          <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <Image
              src={avatarSrc}
              alt={`${profile.name ?? "profile"} avatar`}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full ring-2 ring-white object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold leading-tight">
                {profile.name ?? "Unnamed"}
              </h1>
              <p className="mt-1 text-sm opacity-90">{profile.email}</p>
            </div>
            <div className="text-sm opacity-90">ID: {profile.id}</div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-medium mb-2">About</h2>
            <p className="mb-4 text-sm text-gray-600">
              A quick profile overview. Edit inline to keep your info up to
              date.
            </p>

            {/* Client-side editor removed temporarily — implement a client component at "src/components/profile-editor" to restore interactive editing */}
            <div className="border border-dashed rounded-md p-4 text-sm text-gray-600">
              Client editor not found during build; add
              src/components/profile-editor (a client component) to enable
              inline editing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
