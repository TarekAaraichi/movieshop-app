import prisma from "@/lib/prisma";
import SaveButton from "@/components/SaveButton";
import { updateUser } from "@/app/actions/users";

export default async function EditUserPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 p-8">
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900">
          Edit User
        </h1>
        <form action={updateUser} className="space-y-6">
          <input type="hidden" name="userId" value={user.id} />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            
            <input
              aria-label="Name"
              name="name"
              defaultValue={user.name ?? ""}
              className="mt-1 block w-full p-2 border rounded"
            />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            
            <input
              aria-label="Email"
              name="email"
              defaultValue={user.email ?? ""}
               className="mt-1 block w-full p-2 border rounded"
            />
            </label>
          </div>

          <div>
            <div>
              <div>
                <SaveButton label="Save" />
              </div>
            </div>
          </div>
        </form>

        {/* Navigation handled via redirect after save; no in-page back link */}
      </div>
    </div>
  );
}
