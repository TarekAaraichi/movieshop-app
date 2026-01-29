import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { SaveButton } from "@/components";
import { updateUser } from "@/server/actions/usersActions";

/**
 * Admin: Edit user (duplicate)
 * Server page to edit user roles and details.
 */

export default async function EditUserPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;
  await requireAdmin(`/admin/users/${userId}/edit`);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const address = await prisma.address.findFirst({ where: { userId } });

  // Some optional fields (phone, bio) may not be part of your Prisma User
  // model. Read them safely so we can show editable inputs; later you can
  // extend server actions to persist them.
  type UserOptional = { phone?: string | null; bio?: string | null };
  const userOpt = user as unknown as UserOptional;
  const phoneVal = userOpt.phone ?? "";
  const bioVal = userOpt.bio ?? "";
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleString()
    : "-";
  const updatedAt = user?.updatedAt
    ? new Date(user.updatedAt).toLocaleString()
    : "-";

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-indigo-700 flex items-center justify-center text-xl font-semibold text-white">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Edit user</h1>
            <p className="text-sm text-gray-300 font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm text-gray-300">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">User ID</span>
            <span className="text-gray-200 font-mono text-sm break-all">
              {user?.id}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Role</span>
            <span className="text-slate-800 font-medium">{user?.role}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Created</span>
            <span className="text-slate-800">{createdAt}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Updated</span>
            <span className="text-slate-800">{updatedAt}</span>
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
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg shadow-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                readOnly
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm text-gray-300"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label>
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <input
                name="phone"
                defaultValue={phoneVal}
                placeholder="Phone number (optional)"
                className="w-full mt-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg shadow-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </label>

            <label>
              <span className="text-sm font-medium text-slate-700">Bio</span>
              <textarea
                name="bio"
                defaultValue={bioVal}
                placeholder="Short biography or profile notes (optional)"
                className="w-full mt-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg shadow-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                rows={4}
              />
            </label>
          </div>

          <div>
            <label>
              <span className="text-sm font-medium text-gray-700">
                Image URL
              </span>
              <input
                name="image"
                defaultValue={user.image ?? ""}
                placeholder="https://.../avatar.jpg"
                className="w-full mt-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100"
              />
            </label>
          </div>

          <fieldset className="mt-2 border-t border-gray-700 pt-4">
            <legend className="text-sm font-semibold text-gray-200">
              Address (optional)
            </legend>
            <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
              <input
                name="addressLine1"
                defaultValue={address?.line1 ?? ""}
                placeholder="Address line 1"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
              <input
                name="addressLine2"
                defaultValue={address?.line2 ?? ""}
                placeholder="Address line 2"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
              <input
                name="city"
                defaultValue={address?.city ?? ""}
                placeholder="City"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
              <input
                name="postalCode"
                defaultValue={address?.postalCode ?? ""}
                placeholder="Postal code"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
              <input
                name="country"
                defaultValue={address?.country ?? ""}
                placeholder="Country"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
            </div>
          </fieldset>

          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-400">
              Changes are saved to the user record when you click Save.
            </p>

            <div className="flex items-center gap-3">
              <a
                href={`/admin/users/${user.id}`}
                className="text-sm text-gray-300 hover:text-gray-100"
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
