/**
 * Sign-in page (ensured)
 * Server page that renders the authentication sign-in form.
 */

import { Card } from "@/components";
import { PageWrapper } from "@/components/PageThemeContext";
import { auth } from "@/lib/auth";
import { SignInForm } from "../../components/signinForm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // `searchParams` can be a promise in some Next.js runtimes — await it
  // before accessing properties to avoid runtime warnings.
  const resolvedSearchParams = await searchParams;

  if (session) {
    // If the user is already signed in, redirect to the requested callback or profile
    const callback = resolvedSearchParams?.callbackUrl
      ? String(resolvedSearchParams.callbackUrl)
      : "/profile";
    redirect(callback);
  }

  return (
    <PageWrapper>
      <div className="m-auto max-w-md w-full">
        <Card className="overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 via-purple-500 to-pink-400">
                    MovieShop
                  </span>
                  <span className="ml-2 text-sm text-muted font-medium">
                    Sign in
                  </span>
                </h1>
                <p className="mt-1 text-xs text-muted">
                  Access favorites, orders, and personalized recommendations.
                </p>
              </div>
              <div className="hidden sm:flex items-center text-xs text-muted">
                <span className="px-3 py-1 rounded-full bg-card text-muted">
                  Secure
                </span>
              </div>
            </div>

            <div className="mt-5">
              <SignInForm />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <div className="flex items-center gap-2">
                <span>New here?</span>
                <Link
                  href={
                    resolvedSearchParams && resolvedSearchParams.callbackUrl
                      ? `/sign-up?callbackUrl=${encodeURIComponent(
                          resolvedSearchParams.callbackUrl,
                        )}`
                      : "/sign-up"
                  }
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Create an account
                </Link>
              </div>

              <Link
                href="/forgot-password"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Forgot password?
              </Link>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/api/auth/provider/google"
                  className="inline-flex justify-center items-center gap-2 py-2 rounded-md bg-card border border-border text-sm text-foreground"
                  prefetch={false}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 533.5 544.3"
                    aria-hidden
                  >
                    <path
                      fill="#4285f4"
                      d="M533.5 278.4c0-17.8-1.6-35.1-4.7-51.8H272v98.1h147.2c-6.3 34-25 62.8-53.2 82v68.2h85.9c50.2-46.3 80.6-114.3 80.6-196.5z"
                    />
                    <path
                      fill="#34a853"
                      d="M272 544.3c72.6 0 133.5-23.9 178-64.9l-85.9-68.2c-23.9 16.1-54.6 25.6-92.1 25.6-70.8 0-130.9-47.8-152.3-112.2H32.3v70.8C76.6 485.8 167.7 544.3 272 544.3z"
                    />
                    <path
                      fill="#fbbc04"
                      d="M119.7 325.1c-10.6-31.2-10.6-64.9 0-96.1V158.2H32.3c-39 76.7-39 166.9 0 243.6l87.4-76.7z"
                    />
                    <path
                      fill="#ea4335"
                      d="M272 109.6c39.6 0 75.3 13.6 103.4 40.3l77.5-77.5C405.5 26.7 344.6 3 272 3 167.7 3 76.6 61.5 32.3 158.2l87.4 70.8C141.1 157.4 201.2 109.6 272 109.6z"
                    />
                  </svg>
                  <span>Google</span>
                </Link>
                <Link
                  href="/api/auth/provider/github"
                  className="inline-flex justify-center items-center gap-2 py-2 rounded-md bg-card border border-border text-sm text-foreground"
                  prefetch={false}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M12 .5C5.73.5.78 5.45.78 11.72c0 4.86 3.16 8.98 7.55 10.44.55.1.75-.24.75-.53 0-.26-.01-1-.02-1.96-3.07.67-3.72-1.48-3.72-1.48-.5-1.28-1.22-1.62-1.22-1.62-.99-.67.08-.66.08-.66 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.72.38-1.2.69-1.48-2.45-.28-5.02-1.22-5.02-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.29 3.02 1.13a10.5 10.5 0 012.75-.37c.93 0 1.88.13 2.75.37 2.1-1.42 3.02-1.13 3.02-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.22-2.58 5.16-5.04 5.43.39.34.74 1.02.74 2.06 0 1.49-.01 2.7-.01 3.07 0 .29.2.64.76.53 4.39-1.46 7.55-5.58 7.55-10.44C23.22 5.45 18.27.5 12 .5z" />
                  </svg>
                  <span>GitHub</span>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
