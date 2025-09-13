import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const personSchema = z.object({
  fullName: z.string().min(1),
  bio: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export default function CreatePersonPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Create Person</h2>
        <form action={createPerson} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
              <input
                name="fullName"
                required
                className="mt-1 block w-full p-2 border rounded"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
              <textarea
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
                name="imageUrl"
                type="url"
                placeholder="https://..."
                className="mt-1 block w-full p-2 border rounded"
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Create Person
          </button>
        </form>
      </div>
    </div>
  );
}

async function createPerson(formData: FormData) {
  "use server";
  const raw = Object.fromEntries(formData.entries());
  const parsed = personSchema.parse(raw);

  await prisma.person.create({
    data: {
      fullName: parsed.fullName.trim(),
      bio: parsed.bio ?? null,
      imageUrl: parsed.imageUrl ?? null,
    },
  });

  revalidatePath("/admin");
  redirect("/admin?tab=persons");
}
