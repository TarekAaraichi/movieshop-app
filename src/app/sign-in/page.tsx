import { headers } from "next/headers";
import { Card } from "@/components";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInForm } from "../../components/signinForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    // If the user is already signed in, redirect to the requested callback or profile
    const callback = searchParams?.callbackUrl
      ? String(searchParams.callbackUrl)
      : "/profile";
    redirect(callback);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md w-full">
        <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/6 shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
                    MovieShop
                  </span>
                  <span className="ml-2 text-sm text-gray-300 font-medium">Sign in</span>
                </h1>
                <p className="mt-1 text-xs text-gray-400">
                  Access favorites, orders, and personalized recommendations.
                </p>
              </div>
              <div className="hidden sm:flex items-center text-xs text-gray-400">
                <span className="px-3 py-1 rounded-full bg-white/3">Secure</span>
              </div>
            </div>

            <div className="mt-5">
              <SignInForm />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span>New here?</span>
                <a
                  href={
                    searchParams && searchParams.callbackUrl
                      ? `/sign-up?callbackUrl=${encodeURIComponent(searchParams.callbackUrl)}`
                      : "/sign-up"
                  }
                  className="text-indigo-400 hover:underline"
                >
                  Create an account
                </a>
              </div>

              <a href="/forgot-password" className="text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/6" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/5 px-3 py-1 rounded-full text-gray-300">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <a
                  href="/api/auth/provider/google"
                  className="flex-1 inline-flex justify-center items-center gap-2 py-2 rounded-md bg-white/6 hover:bg-white/8 text-sm text-gray-200"
                >
                  Google
                </a>
                <a
                  href="/api/auth/provider/github"
                  className="flex-1 inline-flex justify-center items-center gap-2 py-2 rounded-md bg-white/6 hover:bg-white/8 text-sm text-gray-200"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
