"use client";

import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SaveButton,
} from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";
import { Card, Input } from "@/components/ui";
import { updateMovie } from "@/server/actions/moviesActions";
import { Movie, Person, Genre } from "@prisma/client";

const formSchema = z.object({
  movieId: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  releaseDate: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid date" }),
  description: z.string().min(1, "Description is required"),
  director: z.string().min(1, "Director is required"),
  actors: z.string().optional().nullable(),
  imageUrl: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url("Invalid URL").optional(),
  ),
  runtime: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v as string, 10) : v),
    z
      .number()
      .int()
      .positive({ message: "Runtime must be a positive integer" }),
  ),
  price: z.preprocess(
    (v) => (typeof v === "string" ? parseFloat(v as string) : v),
    z.number().nonnegative({ message: "Price must be >= 0" }),
  ),
  stock: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v as string, 10) : v),
    z.number().int().nonnegative({ message: "Stock must be >= 0" }),
  ),
  genres: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

type EditMoviePageProps = {
  movie: Movie & {
    people: { person: Person; role: string }[];
    genres: { genre: Genre }[];
  };
};

export default function EditMoviePage({ movie }: EditMoviePageProps) {
  const router = useRouter();

  const directorName =
    movie.people.find((p) => p.role === "DIRECTOR")?.person.fullName ?? "";
  const actorNames = movie.people
    .filter((p) => p.role === "ACTOR")
    .map((p) => p.person.fullName)
    .join(", ");
  const genreNamesDefault = movie.genres.map((mg) => mg.genre.name).join(", ");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    mode: "onTouched",
    defaultValues: {
      movieId: movie.id,
      title: movie.title,
      releaseDate: movie.releaseDate.toISOString().split("T")[0],
      description: movie.description,
      director: directorName,
      actors: actorNames,
      imageUrl: movie.imageUrl ?? "",
      runtime: movie.runtime ?? 0,
      price: movie.price ? parseFloat(String(movie.price)) : 0,
      stock: movie.stock,
      genres: genreNamesDefault,
    },
  });

  async function onSubmit(values: FormValues) {
    const formData = new FormData();
    const record = values as unknown as Record<string, unknown>;
    for (const key in record) {
      const value = record[key];
      if (value != null) formData.append(key, String(value));
    }

    try {
      await updateMovie(formData);
      toast.success("Movie updated successfully!");
      router.push("/admin/movies");
      router.refresh();
    } catch {
      toast.error("Failed to update movie.");
    }
  }

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
              Edit Movie
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100/90">
              Update movie details inline. Changes are applied after saving.
            </p>
          </div>

          <Card className="rounded-3xl border-slate-800 bg-gray-600 p-6 text-slate-100 shadow-2xl sm:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className={fieldGrid}>
                      <div>
                        <FormLabel className={fieldLabelClasses}>
                          Title *
                        </FormLabel>
                        <p className={fieldHintClasses}>
                          Use the official release title.
                        </p>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="e.g., The Great Adventure"
                          {...field}
                          className={inputClasses}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem className={fieldGrid}>
                        <div>
                          <FormLabel className={fieldLabelClasses}>
                            Release Date *
                          </FormLabel>
                          <p className={fieldHintClasses}>
                            Accepted format: YYYY-MM-DD.
                          </p>
                        </div>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className={inputClasses}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="runtime"
                    render={({ field }) => (
                      <FormItem className={fieldGrid}>
                        <div>
                          <FormLabel className={fieldLabelClasses}>
                            Runtime *
                          </FormLabel>
                          <p className={fieldHintClasses}>
                            Enter the duration in minutes.
                          </p>
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="120"
                            {...field}
                            className={inputClasses}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="director"
                    render={({ field }) => (
                      <FormItem className={fieldGrid}>
                        <div>
                          <FormLabel className={fieldLabelClasses}>
                            Director *
                          </FormLabel>
                          <p className={fieldHintClasses}>
                            New names are added automatically.
                          </p>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Director name"
                            {...field}
                            className={inputClasses}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="actors"
                    render={({ field }) => (
                      <FormItem className={fieldGrid}>
                        <div>
                          <FormLabel className={fieldLabelClasses}>
                            Cast
                          </FormLabel>
                          <p className={fieldHintClasses}>
                            Separate each actor with a comma.
                          </p>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Lead Actor, Supporting Actor"
                            {...field}
                            value={field.value ?? ""}
                            className={inputClasses}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className={fieldGrid}>
                        <div>
                          <FormLabel className={fieldLabelClasses}>
                            Price *
                          </FormLabel>
                          <p className={fieldHintClasses}>
                            Specify the retail price in USD.
                          </p>
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            placeholder="19.99"
                            {...field}
                            className={inputClasses}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem className={fieldGrid}>
                        <div>
                          <FormLabel className={fieldLabelClasses}>
                            Stock *
                          </FormLabel>
                          <p className={fieldHintClasses}>
                            Inventory available for purchase.
                          </p>
                        </div>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="50"
                            {...field}
                            className={inputClasses}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className={fieldGrid}>
                      <div>
                        <FormLabel className={fieldLabelClasses}>
                          Poster URL
                        </FormLabel>
                        <p className={fieldHintClasses}>
                          Use a secure (https) link to the artwork.
                        </p>
                      </div>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://..."
                          {...field}
                          value={field.value ?? ""}
                          className={inputClasses}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genres"
                  render={({ field }) => (
                    <FormItem className={fieldGrid}>
                      <div>
                        <FormLabel className={fieldLabelClasses}>
                          Genres
                        </FormLabel>
                        <p className={fieldHintClasses}>
                          Separate each genre with a comma.
                        </p>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Action, Adventure, Sci-Fi"
                          {...field}
                          value={field.value ?? ""}
                          className={inputClasses}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-6">
                  <SaveButton />
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
