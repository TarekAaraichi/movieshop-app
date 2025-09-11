
export default function HomePage() {
  return (
    <div className="font-sans min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header (see layout)*/}

      {/* Main Section */}
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <h1 className="text-center text-3xl sm:text-4xl font-extrabold leading-snug">
          Welcome to the Online Movie Store
          <br />
          <span className="text-teal-400">Project by Team Delta</span>
        </h1>
        <div className="mt-auto">
          <p className="text-sm">
            Webstore under construction - check back soon for updates!
          </p>
        </div>
      </main>

      {/* Footer (see layout)*/}
    </div>
  );
}
