import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const personSchema = z.object({
  fullName: z.string().min(1),
  bio: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export default async function EditPersonPage({
  params,
}: {
  params: { personId: string } | Promise<{ personId: string }>;
}) {
  const p = await params;
  const personId = p.personId;
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: { movies: { select: { role: true } } },
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
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-900">
          Edit Person
        </h2>
        <form
          action={async (formData: FormData) => {
            "use server";
            const raw = Object.fromEntries(formData.entries());
            const parsed = personSchema.parse(raw);
            await prisma.person.update({
              where: { id: personId },
              data: {
                fullName: parsed.fullName.trim(),
                bio: parsed.bio ?? null,
              },
            });
            revalidatePath("/admin");
            redirect("/admin?tab=persons");
          }}
          className="space-y-4"
        >
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
              <input
                defaultValue={
                  (person as unknown as { imageUrl?: string }).imageUrl ?? ""
                }
                name="imageUrl"
                type="url"
                placeholder="https://..."
                className="mt-1 block w-full p-2 border rounded"
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
