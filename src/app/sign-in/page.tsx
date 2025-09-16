import SignInForm from "./form";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full my-10">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">Sign in</h1>

        <p className="mb-6 text-sm leading-6 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm bg-gradient-to-r from-white to-indigo-50 dark:from-transparent dark:via-gray-900 dark:to-gray-800">
          <span className="text-gray-700 dark:text-gray-300">Welcome to</span>
          <span className="mx-2 inline-block align-middle bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500 font-semibold">
            MovieShop
          </span>
          <span className="text-gray-700 dark:text-gray-300">
            — sign in to access your favorites, orders, and recommendations.
          </span>
        </p>

        <SignInForm />

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="text-indigo-600 dark:text-indigo-400">
            Create one
          </a>
        </div>
      </div>
    </div>
  );
}
