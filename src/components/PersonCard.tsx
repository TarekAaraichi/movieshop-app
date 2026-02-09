import Image from "next/image";
import Link from "next/link";
import type { Person } from "@prisma/client";

interface PersonCardProps {
  person: Person;
}

export default function PersonCard({ person }: PersonCardProps) {
  return (
    <Link href={`/persons/${person.id}`} key={person.id}>
      <div className="bg-card rounded-lg shadow-lg overflow-hidden group transform transition-transform hover:scale-105 hover:shadow-2xl">
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
            <div className="w-full h-full bg-popover flex items-center justify-center">
              <span className="text-muted text-xs text-center">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
        </div>
        <div className="p-3">
          <h3 className="text-base sm:text-lg font-semibold leading-tight text-foreground line-clamp-2 truncate">
            {person.fullName}
          </h3>
        </div>
      </div>
    </Link>
  );
}
