import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { SaveButton } from "@/components";
import { updateUser } from "@/server/actions/usersActions";

export default async function EditUserPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;
  await requireAdmin(`/admin/users/${userId}/edit`);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-700">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit user</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        <form action={updateUser} className="flex flex-col gap-4">
          <input type="hidden" name="userId" value={user.id} />

          <div className="flex gap-4">
            <label className="flex-1">
              <span className="sr-only">Full name</span>
              <input
                aria-label="Full name"
                name="name"
                defaultValue={user.name ?? ""}
                placeholder="Full name"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </label>

            <label className="flex-1">
              <span className="sr-only">Email</span>
              <input
                aria-label="Email"
                name="email"
                type="email"
                defaultValue={user.email ?? ""}
                placeholder="Email address"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </label>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500">
              Changes are saved to the user record when you click Save.
            </p>

            <div className="flex items-center gap-3">
              <a
                href={`/admin/users/${user.id}`}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </a>

              <div>
                <SaveButton label="Save" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
