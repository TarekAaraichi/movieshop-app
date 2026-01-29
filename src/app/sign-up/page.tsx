/**
 * Sign-up page (ensured)
 * Server page that renders the authentication sign-up form.
 */

import { headers } from "next/headers";
import SignUpForm from "../../components/signupForm";
import { Card } from "@/components";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    const callback = searchParams?.callbackUrl
      ? String(searchParams.callbackUrl)
      : "/profile";
    redirect(callback);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Form column (DOM first for accessibility / SSR) */}
        <Card className="w-full rounded-2xl p-1 lg:order-last">
          <div className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-700/60 dark:border-gray-800/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-100">
                  Create your account
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Join MovieShop to save favorites and get personalized
                  recommendations.
                </p>
              </div>
              <div className="hidden sm:flex items-center rounded-full px-3 py-1 text-xs bg-gray-800 text-gray-200">
                
                Free Secure
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {/* Social auth placeholder (visually modern, non-functional if not wired) */}
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 shadow-sm hover:shadow-md transition"
                  aria-label="Continue with Google"
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
                </button>

                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 shadow-sm hover:shadow-md transition"
                  aria-label="Continue with GitHub"
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
                </button>
              </div>

              {/* Divider */}
              <div className="relative text-center my-2">
                <span className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 border-t border-gray-700" />
                <span className="relative inline-block bg-gray-800 px-3 text-xs text-gray-300">
                  or
                </span>
              </div>

              {/* Actual form component */}
              <div className="w-full">
                <SignUpForm />
              </div>

              <div className="mt-4 text-center text-sm text-gray-300">
                Already have an account?{" "}
                <a
                  href={
                    searchParams && searchParams.callbackUrl
                      ? `/sign-in?callbackUrl=${encodeURIComponent(
                          String(searchParams.callbackUrl),
                        )}`
                      : "/sign-in"
                  }
                  className="inline-flex items-center gap-1 text-indigo-400 font-medium hover:underline"
                >
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Promo / Visual column (hidden on small screens) — visually left on large screens */}
        <aside className="hidden lg:flex lg:order-first flex-col justify-center rounded-2xl p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl transform transition-all duration-500 hover:-translate-y-1">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Welcome to MovieShop
            </h2>
            <p className="mt-3 text-indigo-100/95 max-w-xs">
              Save favorites, get personalized picks, and discover trending
              films — all in one place.
            </p>
          </div>

          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-green-400">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium">
                Personalized recommendations
              </span>
            </li>

            <li className="flex items-cente gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-green-400">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7M7 21h10"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium">
                Save favorites & build lists
              </span>
            </li>

            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-green-400">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium">
                Stay up-to-date with trends
              </span>
            </li>
          </ul>

          <div className="mt-6 text-sm text-indigo-50/90">
            Trusted by movie lovers. No spam — ever.
          </div>
        </aside>
      </div>
    </div>
  );
}
