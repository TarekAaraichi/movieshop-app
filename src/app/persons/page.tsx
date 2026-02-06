import { AutoSubmitSelect } from "@/components";
import PaginationControls from "@/components/PaginationControls";
import { PersonSearch } from "@/components/PersonSearch";
import { PageWrapper } from "@/components/PageThemeContext";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { PersonRole } from "@prisma/client";
import type { Prisma } from "@prisma/client";

interface PersonsPageProps {
  searchParams: {
    q?: string;
    role?: string;
    page?: string;
    per_page?: string;
  };
}

export default async function PersonsPage({ searchParams }: PersonsPageProps) {
  const q = searchParams.q ?? "";
  const role = searchParams.role ?? "";
  const page = Number(searchParams.page ?? "1");
  const perPage = Number(searchParams.per_page ?? "12");

  const skip = (page - 1) * perPage;

  const where: Prisma.PersonWhereInput = {};
  if (q) {
    where.fullName = {
      contains: q,
      mode: "insensitive",
    };
  }
  const validRoles = Object.values(PersonRole) as Array<PersonRole>;
  const roleFilter =
    role && validRoles.includes(role as PersonRole)
      ? (role as PersonRole)
      : undefined;

  if (roleFilter) {
    where.movies = {
      some: {
        role: {
          equals: roleFilter,
        },
      },
    };
  }

  const totalCount = await prisma.person.count({ where });

  const persons = await prisma.person.findMany({
    where,
    orderBy: {
      fullName: "asc",
    },
    take: perPage,
    skip,
  });

  const personRolesRaw = await prisma.moviePerson.findMany({
    select: { role: true },
    distinct: ["role"],
  });
  const personRoles = Array.from(
    new Set(personRolesRaw.map((r) => r.role)),
  ).filter(Boolean);

  const hasNextPage = skip + perPage < totalCount;
  const hasPrevPage = skip > 0;

  return (
    <PageWrapper>
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
            People
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Showing {persons.length} of {totalCount} people.
          </p>
        </header>

        <form className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <PersonSearch />
          <div className="w-full md:w-auto">
            <AutoSubmitSelect
              name="role"
              value={role}
              ariaLabel="Filter by role"
              options={personRoles.map((r) => ({ value: r, label: r }))}
              className="w-full"
            />
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {persons.map((person) => (
            <Link href={`/persons/${person.id}`} key={person.id}>
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden group transform transition-transform hover:scale-105 hover:shadow-2xl">
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
                    <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                      <span className="text-neutral-500 dark:text-neutral-400 text-xs text-center">
                        No Image
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="p-3">
                  <h3 className="text-base sm:text-lg font-semibold leading-tight bg-clip-text text-transparent bg-cyan-50 line-clamp-2 truncate">
                    {person.fullName}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
          {persons.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-500 dark:text-neutral-400">
                No people found matching your criteria.
              </p>
            </div>
          )}
        </div>

        <PaginationControls
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          totalCount={totalCount}
          pageSize={perPage}
          basePath="/persons"
        />
      </div>
    </PageWrapper>
  );
}
