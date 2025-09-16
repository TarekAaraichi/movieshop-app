import { headers } from "next/headers";
import SignUpForm from "./form";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  // const session = await auth.api.getSession({
  //     headers: await headers(),
  // });

  // if (session) {
  //     // If the user is already signed in, redirect to the home page or dashboard
  //     redirect("/");
  // };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <Card className="max-w-md w-full my-10">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-6">
            Create your account
          </h1>

          <p className="mb-6 text-sm leading-6 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm bg-gradient-to-r from-white to-indigo-50 dark:from-transparent dark:via-gray-900 dark:to-gray-800">
            <span className="text-gray-700 dark:text-gray-300">Join the </span>
            <span className="mx-2 inline-block align-middle bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500 font-semibold">
              MovieShop
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              {" "}
              club now to save favorites, get personalized recommendations, and
              discover trending films.
            </span>
          </p>

          <SignUpForm />

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/sign-in" className="text-indigo-600 dark:text-indigo-400">
              Sign in
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
