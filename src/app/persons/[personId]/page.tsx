// src/app/persons/[personId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function PersonPage({
  params,
}: {
  params: { personId: string } | Promise<{ personId: string }>;
}) {
  const p = await params;
  const personId = p.personId;
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      movies: {
        include: { movie: true },
      },
    },
  });

  if (!person) return notFound();

  /*
    Optional auth scaffold (commented out):
    If person pages should be private, uncomment and adapt this check.
    Example:
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/persons/${personId}`)}`);
  */

  const movies = person.movies ?? [];
  // compute unique roles (e.g. DIRECTOR, ACTOR) from MoviePerson entries
  const roles = Array.from(new Set(movies.map((m) => m.role))).filter(Boolean);
  const prettyRole = (r: string) => {
    if (r === "DIRECTOR") return "Director";
    if (r === "ACTOR") return "Actor";
    return r;
  };
  const rolesDisplay = roles.length ? roles.map(prettyRole).join(", ") : null;

  const containerStyle: React.CSSProperties = {
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue'",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg,#0f1724 0%, #0b1220 50%, #071025 100%)",
    color: "#e6eef8",
    padding: "2rem 1rem",
  };

  const mainStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    flexGrow: 1,
    padding: 8,
  };

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    gap: 24,
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 14,
    background: "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    boxShadow: "0 6px 30px rgba(2,6,23,0.6)",
    backdropFilter: "blur(6px)",
  };

  const avatarWrapStyle: React.CSSProperties = {
    width: 192,
    minWidth: 192,
    height: 192,
    borderRadius: "50%",
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(3,7,18,0.6)",
    flexShrink: 0,
    position: "relative",
    background: "#0b1220",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 32,
    fontWeight: 800,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "linear-gradient(90deg,#22c55e,#3b82f6)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };

  const roleChipStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    padding: "6px 10px",
    borderRadius: 999,
    background: "linear-gradient(to right, rgba(255,255,255,0.4), rgba(148,163,184,0.3))",
    color: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "inline-block",
    marginLeft: 8,
  };

  const bioStyle: React.CSSProperties = { color: "#cbd5e1", marginTop: 10, lineHeight: 1.5 };

  const moviesGridStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  };

  const movieCardStyle: React.CSSProperties = {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.02)",
    transition: "transform .18s ease, box-shadow .18s ease",
    cursor: "pointer",
    minWidth: 280,
  };

  const movieCardHover: React.CSSProperties = {
    transform: "translateY(-4px)",
    boxShadow: "0 10px 30px rgba(2,6,23,0.6)",
  };

  return (
    <div >
      <main className="w-full max-w-[1100px] mx-auto flex-grow p-2">
      <section className="flex flex-row gap-6 items-start p-5 rounded-[14px] bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] shadow-[0_6px_30px_rgba(2,6,23,0.6)] backdrop-blur-sm">
        <div className="w-48 min-w-[192px] h-48 rounded-full overflow-hidden shadow-xl flex-shrink-0 relative bg-[#0b1220]">
        <Image
          src={person.imageUrl ?? "/file.svg"}
          alt={person.fullName}
          fill
          sizes="(max-width: 768px) 100vw, 200px"
          className="object-cover"
        />
        </div>

        <div className="flex-1 min-w-0">
        <h1 className="text-[32px] font-extrabold m-0 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
          {person.fullName}
          {rolesDisplay ? (
          <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-white/40 via-slate-400/30 text-white/80 border border-white/10 ml-2">
            {rolesDisplay}
          </span>
          ) : null}
        </h1>

        {person.bio ? (
          <p className="text-slate-300 mt-2 leading-relaxed">{person.bio}</p>
        ) : (
          <p className="text-slate-500 mt-2">No bio available.</p>
        )}

        <h2 className="mt-5 mb-2 text-[20px] font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
          Movies
        </h2>

        {movies.length === 0 ? (
          <p className="text-slate-400">No movies found for this person.</p>
        ) : (
          <div className="flex flex-wrap gap-3 mt-3">
          {movies.map((mp) => (
            <Link
            key={`${mp.movie.id}-${mp.role}`}
            href={`/movies/${mp.movie.id}`}
            className="flex gap-3 items-center p-3 rounded-lg bg-[rgba(255,255,255,0.02)] transition-transform duration-150 ease-in-out hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(2,6,23,0.6)] cursor-pointer min-w-[280px]"
            >
            {mp.movie.imageUrl ? (
              <div className="w-16 h-24 relative flex-shrink-0 rounded-md overflow-hidden">
              <Image
                src={mp.movie.imageUrl}
                alt={mp.movie.title}
                fill
                sizes="64px"
                className="object-cover rounded-md"
              />
              </div>
            ) : (
              <div className="w-16 h-24 bg-[#061827] rounded-md flex-shrink-0" />
            )}

            <div className="flex flex-col">
              <div className="font-bold text-[#e6eef8]">{mp.movie.title}</div>
              <div className="text-sm text-slate-400 mt-1">{prettyRole(mp.role)}</div>
            </div>
            </Link>
          ))}
          </div>
        )}
        </div>
      </section>
      </main>
    </div>
  );
}
