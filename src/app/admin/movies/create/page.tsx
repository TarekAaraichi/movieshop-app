"use client";

import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  AddButton,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";
import { Card, Input } from "@/components/ui";
import { createMovie } from "@/server/actions/moviesActions";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  releaseDate: z
    .string()
    .optional()
    .refine(
      (s) => s === "" || s === undefined || !Number.isNaN(Date.parse(s)),
      {
        message: "Invalid date",
      },
    ),
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

export default function CreateMoviePage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    mode: "onTouched",
    defaultValues: {
      title: "",
      releaseDate: "",
      description: "",
      director: "",
      actors: "",
      imageUrl: "",
      runtime: 0,
      price: 0,
      stock: 0,
      genres: "",
    },
  });

  async function onSubmit(values: FormValues) {
    const formData = new FormData();
    // build formData object
    Object.keys(values).forEach((key) => {
      const value = values[key as keyof FormValues];
      if (value != null) {
        formData.append(key, String(value));
      }
    });

    try {
      await createMovie(formData);
      // The server action will redirect on success, so we might not even see this.
      // But it's good practice to have client-side feedback.
      toast.success("Movie created successfully! Redirecting...");
      // Manually redirect as a fallback.
      router.push("/admin?tab=movies");
      router.refresh(); // Ensures the movie list is updated
    } catch (error) {
      // Server actions throw errors on failure.
      toast.error(
        error instanceof Error ? error.message : "Failed to create movie.",
      );
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40 bg-popover placeholder:text-muted";
  const fieldLabelClasses = "text-sm font-semibold text-foreground";
  const fieldHintClasses = "mt-1 text-xs font-medium text-muted";
  const fieldGrid = "grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center";

  return (
    <PageWrapper>
      <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              Create Movie
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Provide production details, pricing, and metadata to publish a new
              movie in the catalog. Fields marked with * are required.
            </p>
          </div>

          <Card className="rounded-3xl border-border bg-card p-6 text-foreground shadow-2xl sm:p-8">
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
                  <AddButton
                    buttonText="Create Movie"
                    type="submit"
                    disabled={form.formState.isSubmitting}
                  />
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
