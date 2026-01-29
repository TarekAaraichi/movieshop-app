import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function PersonsPage() {
  const persons = await prisma.person.findMany({
    orderBy: {
      fullName: "asc",
    },
  });

  return (
    <div className="w-full  mx-auto p-4 bg-gray-900 rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-emerald-400">All People</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {persons.map((person) => (
          <Link href={`/persons/${person.id}`} key={person.id}>
            <div className="bg-neutral-800 rounded-lg shadow-lg overflow-hidden group transform transition-transform hover:scale-105 hover:shadow-2xl">
              <div className="relative w-full aspect-[2/3]">
                {person.imageUrl ? (
                  <Image
                    src={person.imageUrl}
                    alt={person.fullName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                    <span className="text-neutral-400 text-xs text-center">
                      No Image
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-white truncate group-hover:text-emerald-400">
                  {person.fullName}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
