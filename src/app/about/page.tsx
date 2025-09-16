import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-800">
    <Card className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-blue-600 ">About Us</h1>
          <p className="mb-4 text-sm leading-6 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm bg-gradient-to-r from-white to-indigo-50 dark:from-transparent dark:via-gray-900 dark:to-gray-800">
            <span className="text-gray-700 dark:text-gray-300">Welcome to</span>
            <span className="mx-2 inline-block align-middle bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500 font-semibold">
              MovieShop
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              ! We, <span className="font-semibold">Delta Team</span>, are
              passionate about bringing you the best movies to enjoy. Our mission
              is to provide a seamless and enjoyable movie shopping experience.
            </span>
          </p>
    </Card>


 

    
      </div>

  );
}
