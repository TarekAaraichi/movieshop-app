import { Card } from "@/components/ui/card";

/**
 * Contact page (ensured)
 * Server-rendered contact form and contact information.
 */

export default function ContactPage() {
  return (
    <div>
      <div className="m-auto max-w-4xl w-full">
        <Card className="p-6 sm:p-8">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-100">
              Contact
            </h1>
            <p className="mt-2 text-sm text-gray-300 max-w-2xl">
              We&apos;d love to hear from you. For questions about the demo,
              contributions, or feature requests, reach out to the team. Quick
              links and people below.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <section className="space-y-4">
              <h2 className="text-sm font-medium text-gray-200">Team</h2>

              <ul className="space-y-3">
                {[
                  {
                    name: "Tarek Aaraichi",
                    role: "Frontend / Integrations",
                    linkedin: "https://www.linkedin.com/in/tarek-aaraichi",
                    github: "https://github.com/TarekAaraichi",
                    email: "tarek.aaraichi@gmail.com",
                    color: "bg-gradient-to-br from-rose-500 to-pink-500",
                  },
                  {
                    name: "Johan Skaneby",
                    role: "Backend / DB",
                    linkedin: "https://www.linkedin.com/in/johan-skaneby",
                    github: "https://github.com/johanskaneby",
                    email: "johan@example.com",
                    color: "bg-gradient-to-br from-blue-500 to-indigo-500",
                  },
                  {
                    name: "Josef Rega",
                    role: "UX / Design",
                    linkedin: "https://www.linkedin.com/in/josef-rega",
                    github: "https://github.com/josefrega",
                    email: "josef@example.com",
                    color: "bg-gradient-to-br from-emerald-400 to-teal-600",
                  },
                ].map((p) => (
                  <li
                    key={p.email}
                    className="flex items-center gap-4 bg-gray-800/40 rounded-lg p-3 sm:p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full text-white ${p.color} flex-shrink-0`}
                      aria-hidden="true"
                    >
                      {p.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate">
                          <div className="text-sm font-medium text-gray-100 truncate">
                            {p.name}
                          </div>
                          <div className="text-xs text-gray-300 mt-0.5 truncate">
                            {p.role}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <a
                            href={p.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${p.name} on LinkedIn`}
                            className="p-2 rounded-md bg-gray-800/40 hover:bg-gray-800/50 transition-colors text-blue-300"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          </a>
                          <a
                            href={p.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${p.name} on GitHub`}
                            className="p-2 rounded-md bg-gray-800/40 hover:bg-gray-800/50 transition-colors text-gray-100"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </a>
                          <a
                            href={`mailto:${p.email}`}
                            aria-label={`Email ${p.name}`}
                            className="p-2 rounded-md bg-gray-800/40 hover:bg-gray-800/50 transition-colors text-rose-300"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M12 13.065L.75 4.5V19.5A2.25 2.25 0 0 0 3 21.75h18A2.25 2.25 0 0 0 23.25 19.5V4.5L12 13.065zM12 10.935L23.25 2.25H.75L12 10.935z" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-gradient-to-b from-gray-800/20 to-gray-800/10 rounded-xl p-5 sm:p-6">
              <h2 className="text-sm font-medium text-gray-200">
                Get in touch
              </h2>
              <div className="mt-3 text-sm text-gray-300 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-gray-300">General</div>
                    <a
                      href="mailto:hello@movieshop.example"
                      className="text-teal-300 font-medium hover:underline text-sm"
                    >
                      hello@movieshop.example
                    </a>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-400">Open source</div>
                    <a
                      href="https://github.com/Gr-25-13/movieshop-delta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-100 bg-white/6 px-3 py-1 rounded-md hover:bg-white/10"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.38-3.88-1.38-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.72 1.26 3.39.96.11-.75.41-1.26.75-1.55-2.55-.29-5.23-1.28-5.23-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.21-1.5 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.44-2.69 5.41-5.25 5.69.42.36.8 1.08.8 2.18 0 1.57-.01 2.83-.01 3.22 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.66 18.35.5 12 .5z" />
                      </svg>
                      Repository
                    </a>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/6 text-sm text-gray-400">
                  Want faster support or to contribute? Open an issue or pull
                  request on GitHub and tag the team — we usually respond within
                  a few business days.
                </div>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
