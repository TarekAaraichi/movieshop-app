/**
 * Admin: Create person (ensured)
 * Server page to create a person/actor record.
 */

import { Card } from "@/components/ui";
import { createPerson } from "@/server/actions/personsActions";
import PersonCreateClientValidator from "@/components/PersonCreateClientValidator";
import { PageWrapper } from "@/components/PageThemeContext";
import { requireAdmin } from "@/lib/requireAdmin";

export default function CreatePersonPage() {
  void requireAdmin("/admin/persons/create");

  const inputClasses =
    "w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-slate-500 !bg-white";
  const fieldLabelClasses = "text-sm font-semibold text-slate-200";
  const fieldHintClasses = "mt-1 text-xs font-medium text-slate-400";
  const fieldGrid = "grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center";

  return (
    <PageWrapper>
      <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="rounded-3xl border border-slate-200/10 bg-gray-600 p-6 sm:p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Create Person
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100/90">
              Add a new person to the catalog. Fields marked with * are
              required.
            </p>
          </div>

          <Card className="rounded-3xl border-slate-800 bg-gray-600 p-6 text-slate-100 shadow-2xl sm:p-8">
            <form
              id="create-person-form"
              action={createPerson}
              className="space-y-6"
            >
              <div className={fieldGrid}>
                <div>
                  <label htmlFor="fullName" className={fieldLabelClasses}>
                    Full name *
                  </label>
                  <p className={fieldHintClasses}>
                    Use the person's full name.
                  </p>
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="e.g. Christopher Nolan"
                  className={inputClasses}
                />
              </div>

              <div className={fieldGrid}>
                <div>
                  <label htmlFor="imageUrl" className={fieldLabelClasses}>
                    Image URL
                  </label>
                  <p className={fieldHintClasses}>
                    Secure (https) link to avatar.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://..."
                    className={inputClasses}
                  />
                  <div
                    aria-hidden
                    className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-300 border border-gray-700"
                  >
                    Avatar
                  </div>
                </div>
              </div>

              <div className={fieldGrid}>
                <div>
                  <label htmlFor="bio" className={fieldLabelClasses}>
                    Bio
                  </label>
                  <p className={fieldHintClasses}>
                    Short biography and highlights.
                  </p>
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  rows={5}
                  placeholder="Short biography, career highlights..."
                  className="w-full rounded-lg border border-slate-300 !bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-slate-500"
                />
              </div>

              <div className="flex justify-end">
                <div className="w-full sm:w-auto">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Create Person
                  </button>
                </div>
              </div>
            </form>
            <PersonCreateClientValidator formId="create-person-form" />
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

// Server action handled by src/app/actions/persons.ts
