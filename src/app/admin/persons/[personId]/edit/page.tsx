import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { updatePerson } from "@/app/actions/persons";
import SaveButton from "@/components/SaveButton";

export default async function EditPersonPage({
  params,
}: {
  params: { personId: string } | Promise<{ personId: string }>;
}) {
  const p = await params;
  await requireAdmin(`/admin/persons/${p.personId}/edit`);
  const personId = p.personId;
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: {
      id: true,
      fullName: true,
      bio: true,
      imageUrl: true,
      movies: { select: { role: true } },
    },
  });
  if (!person) return <div className="p-6">Person not found</div>;

  // compute unique roles for display (e.g. Director, Actor)
  const roles = Array.from(new Set((person.movies ?? []).map((m) => m.role)));
  const pretty = (r: string) => {
    if (r === "DIRECTOR") return "Director";
    if (r === "ACTOR") return "Actor";
    return r;
  };
  const rolesDisplay = roles.length ? roles.map(pretty).join(", ") : "—";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 p-8">
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900">
          Edit Person
        </h1>
        <form action={updatePerson} className="space-y-6">
          <input type="hidden" name="personId" value={personId} />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
              <input
                defaultValue={person.fullName}
                name="fullName"
                required
                className="mt-1 block w-full p-2 border rounded"
              />
            </label>
          </div>
          {/* Role is stored on MoviePerson relation; not on Person model */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
              <input
                readOnly
                value={rolesDisplay}
                className="mt-1 block w-full p-2 border rounded bg-gray-100"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
              <textarea
                defaultValue={person.bio ?? ""}
                name="bio"
                rows={4}
                className="mt-1 block w-full p-2 border rounded"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <div className="mt-2 mb-2 flex text-gray-700 items-center gap-4">
              <div className="flex-1">
                <input
                  defaultValue={person.imageUrl ?? ""}
                  name="imageUrl"
                  type="url"
                  placeholder="https://..."
                  className="mt-1 block w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
          <SaveButton label="Save" />
        </form>
      </div>
    </div>
  );
}
