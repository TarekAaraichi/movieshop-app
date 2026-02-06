import { AddButton } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";
import MovieCreateClientValidator from "@/components/MovieCreateClientValidator";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/requireAdmin";
import { createMovie } from "@/server/actions/moviesActions";

/**
 * Admin: Create movie (ensured)
 * Server page to create a new movie (admin only).
 */

/**
 * Renders the Create Movie page with a form for adding a new movie.
 * The form includes fields for title, release date, description, director, actors, image URL, runtime, price, stock, and genres.
 * On submission, the form calls the createMovie server action to persist the new movie.
 */
export default async function CreateMoviePage() {
  // Note: this is a server component; call shared requireAdmin at render-time
  // redirect must match this page route
  await requireAdmin("/admin/movies/create");
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
              Create Movie
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100/90">
              Provide production details, pricing, and metadata to publish a new
              movie in the catalog. Fields marked with * are required.
            </p>
          </div>

          <Card className="rounded-3xl border-slate-800 bg-gray-600 p-6 text-slate-100 shadow-2xl sm:p-8">
            <form
              id="create-movie-form"
              action={createMovie}
              className="space-y-6"
            >
              <div className={fieldGrid}>
                <div>
                  <label htmlFor="title" className={fieldLabelClasses}>
                    Title *
                  </label>
                  <p className={fieldHintClasses}>
                    Use the official release title.
                  </p>
                </div>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g., The Great Adventure"
                  className={inputClasses}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className={fieldGrid}>
                  <div>
                    <label htmlFor="releaseDate" className={fieldLabelClasses}>
                      Release Date *
                    </label>
                    <p className={fieldHintClasses}>
                      Accepted format: YYYY-MM-DD.
                    </p>
                  </div>
                  <input
                    id="releaseDate"
                    name="releaseDate"
                    type="date"
                    required
                    className={inputClasses}
                  />
                </div>

                <div className={fieldGrid}>
                  <div>
                    <label htmlFor="runtime" className={fieldLabelClasses}>
                      Runtime *
                    </label>
                    <p className={fieldHintClasses}>
                      Enter the duration in minutes.
                    </p>
                  </div>
                  <input
                    id="runtime"
                    name="runtime"
                    type="number"
                    min={1}
                    required
                    placeholder="120"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className={fieldGrid}>
                  <div>
                    <label htmlFor="director" className={fieldLabelClasses}>
                      Director *
                    </label>
                    <p className={fieldHintClasses}>
                      New names are added automatically.
                    </p>
                  </div>
                  <input
                    id="director"
                    name="director"
                    type="text"
                    required
                    placeholder="Director name"
                    className={inputClasses}
                  />
                </div>

                <div className={fieldGrid}>
                  <div>
                    <label htmlFor="actors" className={fieldLabelClasses}>
                      Cast
                    </label>
                    <p className={fieldHintClasses}>
                      Separate each actor with a comma.
                    </p>
                  </div>
                  <input
                    id="actors"
                    name="actors"
                    type="text"
                    placeholder="Lead Actor, Supporting Actor"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className={fieldGrid}>
                  <div>
                    <label htmlFor="price" className={fieldLabelClasses}>
                      Price *
                    </label>
                    <p className={fieldHintClasses}>
                      Specify the retail price in USD.
                    </p>
                  </div>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    placeholder="19.99"
                    className={inputClasses}
                  />
                </div>

                <div className={fieldGrid}>
                  <div>
                    <label htmlFor="stock" className={fieldLabelClasses}>
                      Stock *
                    </label>
                    <p className={fieldHintClasses}>
                      Inventory available for purchase.
                    </p>
                  </div>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min={0}
                    required
                    placeholder="50"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className={fieldGrid}>
                <div>
                  <label htmlFor="imageUrl" className={fieldLabelClasses}>
                    Poster URL
                  </label>
                  <p className={fieldHintClasses}>
                    Use a secure (https) link to the artwork.
                  </p>
                </div>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://..."
                  className={inputClasses}
                />
              </div>

              <div className={fieldGrid}>
                <div>
                  <label htmlFor="genres" className={fieldLabelClasses}>
                    Genres *
                  </label>
                  <p className={fieldHintClasses}>
                    Comma-separated values—new genres are created automatically.
                  </p>
                </div>
                <input
                  id="genres"
                  name="genres"
                  type="text"
                  required
                  placeholder="Action, Drama, Sci-Fi"
                  className={inputClasses}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className={fieldLabelClasses}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  placeholder="A concise synopsis for merchandising and storefront placement."
                  className="w-full rounded-lg border border-slate-300 !bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder:text-slate-500"
                />
              </div>

              <div className="flex justify-end">
                <div className="w-full sm:w-auto">
                  <AddButton />
                </div>
              </div>
            </form>
            <MovieCreateClientValidator formId="create-movie-form" />
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
