import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const personSchema = z.object({
  fullName: z.string().min(1),
  bio: z.string().optional().nullable(),
  // allow empty string or whitespace from form -> treat as null; if non-empty enforce URL format
  imageUrl: z.preprocess((v) => {
    if (typeof v === "string") {
      const t = v.trim();
      if (t === "") return null;
      return t;
    }
    return v;
  }, z.string().url().nullable()),
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
                imageUrl: parsed.imageUrl ?? null,
              },
            });
            // revalidate admin list, admin edit page, and public person page so updated image is visible everywhere
            revalidatePath("/admin");
            revalidatePath(`/admin/persons/${personId}/edit`);
            revalidatePath(`/persons/${personId}`);
            // redirect back to the edit page so the admin sees the updated image immediately
            redirect(`/admin/persons/${personId}/edit`);
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
