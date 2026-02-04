import { SaveButton } from "@/components";
import { Card } from "@/components/ui";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { updatePerson } from "@/server/actions/personsActions";
import Image from "next/image";

/**
 * Admin: Edit person (duplicate)
 * Server page to edit person/actor information.
 */

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
    <div>
      <div className="mx-auto max-w-5xl">
        <Card className="p-6 sm:p-8 rounded-2xl shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
              Edit Person
            </h1>
            <div className="hidden sm:flex items-center gap-3">
              {/* <button
          form="edit-person-form"
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Save
        </button> */}
            </div>
          </div>

          <form
            id="edit-person-form"
            action={updatePerson}
            className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start"
          >
            <input type="hidden" name="personId" value={personId} />

            {/* Left column: main fields */}
            <div className="sm:col-span-2 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-300">
                  Full name
                </span>
                <input
                  defaultValue={person.fullName}
                  name="fullName"
                  required
                  className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="First Last"
                />
              </label>

              <div>
                <span className="text-sm font-medium text-gray-700">Role</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(roles.length ? roles : []).map((r) => {
                    const label =
                      r === "DIRECTOR"
                        ? "Director"
                        : r === "ACTOR"
                          ? "Actor"
                          : r;
                    return (
                      <span
                        key={r}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800 text-sm font-medium text-gray-100"
                      >
                        {label}
                      </span>
                    );
                  })}
                  {!roles.length && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800 text-sm text-gray-400">
                      —
                    </span>
                  )}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Bio</span>
                <textarea
                  defaultValue={person.bio ?? ""}
                  name="bio"
                  rows={4}
                  className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Short bio or notes about this person..."
                />
              </label>

              <div>
                <label className="block">
                  <span className="flex items-center justify-between text-sm font-medium text-gray-700">
                    Image URL
                    <span className="text-xs text-gray-400">
                      Preview updates instantly
                    </span>
                  </span>
                  <input
                    defaultValue={person.imageUrl ?? ""}
                    name="imageUrl"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>

              {/* Mobile save button */}
              <div className="sm:hidden pt-2">
                <SaveButton label="Save" />
              </div>
            </div>

            {/* Right column: image preview & quick info */}
            <aside className="flex flex-col items-center gap-4">
              <div className="w-full rounded-lg border border-gray-700 bg-gray-800 p-4 flex flex-col items-center">
                <div className="relative w-36 h-36 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                  {person.imageUrl ? (
                    <Image
                      src={person.imageUrl}
                      alt={person.fullName}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-4xl">
                      {person.fullName?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-center">
                  <p className="text-sm font-semibold text-gray-100">
                    {person.fullName}
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    {roles.length ? rolesDisplay : "No role assigned"}
                  </p>
                </div>
              </div>

              <div className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-sm text-gray-300">
                <p className="font-medium text-gray-100 mb-1">Quick tips</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Use a square image for best results.</li>
                  <li>
                    Roles are tied to movies — edit via the movie relations.
                  </li>
                  <li>Save to apply changes across the app.</li>
                </ul>
              </div>

              <div className="w-full">
                <a
                  href={`/persons/${personId}`}
                  className="block text-center text-sm text-indigo-400 hover:underline"
                >
                  View person page
                </a>
              </div>
            </aside>
          </form>

          {/* Desktop inline Save (keeps visual parity if JS/styles load late) */}
          <div className="mt-6 hidden sm:flex justify-end">
            <button
              form="edit-person-form"
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
