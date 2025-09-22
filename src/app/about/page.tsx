import { Card } from "@/components";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100 px-4">
      <Card className="bg-white/95 shadow-lg rounded-lg p-8 max-w-3xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              About MovieShop
            </h1>
            <p className="text-gray-700 leading-relaxed">
              MovieShop is a demonstration storefront built by{" "}
              <span className="font-semibold">Delta Team</span> to showcase
              server actions, DB-backed carts with migration/merge semantics,
              and secure admin routes using Better Auth. We emphasize simple,
              testable patterns and clear separation between server services and
              client UI.
            </p>
          </div>

          <aside className="hidden md:block bg-gray-50 p-4 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Built With
            </h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Next.js App Router</li>
              <li>Prisma + PostgreSQL</li>
              <li>Tailwind CSS</li>
              <li>Better Auth (session + roles)</li>
            </ul>
          </aside>
        </div>
      </Card>
    </div>
  );
}
