/**
 * Admin: Create person (ensured)
 * Server page to create a person/actor record.
 */

import { Card } from "@/components/ui";
import { createPerson } from "@/server/actions/personsActions";
import { requireAdmin } from "@/lib/requireAdmin";

export default function CreatePersonPage() {
  void requireAdmin("/admin/persons/create");
  return (
    <div>
      <div className="mx-auto max-w-3xl">
        <Card className="p-6 sm:p-8 rounded-2xl shadow-2xl bg-gray-900 border border-gray-800">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100">
              Create a Person
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Add a new person to the persons catalog. Use the inline fields for
              a quicker workflow.
            </p>
          </header>

          <form action={createPerson} className="space-y-6">
            {/* Full Name (inline label) */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div className="col-span-9">
                <input
                  name="fullName"
                  required
                  placeholder="e.g. Christopher Nolan"
                  className="w-full rounded-lg border border-gray-700 px-4 py-2 bg-gray-900 shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 transition text-gray-100 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Image URL (inline with a compact preview placeholder) */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-sm font-medium text-gray-300">
                Image URL
              </label>
              <div className="col-span-9 flex items-center gap-4">
                <input
                  name="imageUrl"
                  type="url"
                  placeholder="https://..."
                  className="flex-1 rounded-lg border border-gray-700 px-4 py-2 bg-gray-900 shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 transition text-gray-100 placeholder-gray-500"
                />
                <div
                  aria-hidden
                  className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-300 border border-gray-700"
                >
                  Avatar
                </div>
              </div>
            </div>

            {/* Bio (label inline, textarea spans) */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <label className="col-span-3 text-sm font-medium text-gray-300">
                Bio
              </label>
              <div className="col-span-9">
                <textarea
                  name="bio"
                  rows={4}
                  placeholder="Short biography, career highlights..."
                  className="w-full min-h-[110px] rounded-lg border border-gray-700 px-4 py-2 bg-gray-900 shadow-sm
                           focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-vertical text-gray-100 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                         text-white py-3 rounded-lg font-medium transition-shadow shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Create Person
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

// Server action handled by src/app/actions/persons.ts
