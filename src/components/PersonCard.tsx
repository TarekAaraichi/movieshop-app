import Image from "next/image";
import Link from "next/link";
import type { Person } from "@prisma/client";

interface PersonCardProps {
  person: Person;
}

export default function PersonCard({ person }: PersonCardProps) {
  return (
    <Link href={`/persons/${person.id}`} key={person.id}>
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden group transform transition-transform hover:scale-105 hover:shadow-2xl">
        <div className="relative w-full aspect-2/3">
          {person.imageUrl ? (
            <Image
              src={person.imageUrl}
              alt={person.fullName}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <span className="text-neutral-500 dark:text-neutral-400 text-xs text-center">
                No Image
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
        </div>
        <div className="p-3">
          <h3 className="text-base sm:text-lg font-semibold leading-tight text-gray-800 dark:bg-clip-text dark:text-transparent dark:bg-cyan-50 line-clamp-2 truncate">
            {person.fullName}
          </h3>
        </div>
      </div>
    </Link>
  );
}
