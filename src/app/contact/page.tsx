export default function ContactPage() {
  return (
    <div>
      <div className="m-auto max-w-4xl w-full bg-white/5 backdrop-blur-sm border border-white/6 rounded-2xl shadow-2xl p-6 sm:p-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-100">
            Contact
          </h1>
          <p className="mt-2 text-sm text-gray-300 max-w-2xl">
            We&apos;d love to hear from you. For questions about the demo, contributions,
            or feature requests, reach out to the team. Quick links and people below.
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
                  github: "https://github.com/tarek-aaraichi",
                  email: "tarek@example.com",
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
                  className="flex items-center gap-4 bg-white/3 rounded-lg p-3 sm:p-4 hover:bg-white/6 transition-colors"
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
                          className="p-2 rounded-md bg-white/4 hover:bg-white/8 transition-colors text-blue-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8.5h5V24H0V8.5zM8.5 8.5h4.8v2.06h.07c.67-1.27 2.3-2.6 4.73-2.6 5.06 0 6 3.33 6 7.66V24h-5V16.6c0-1.76-.03-4.03-2.46-4.03-2.47 0-2.85 1.93-2.85 3.92V24h-5V8.5z" />
                          </svg>
                        </a>

                        <a
                          href={p.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${p.name} on GitHub`}
                          className="p-2 rounded-md bg-white/4 hover:bg-white/8 transition-colors text-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.38-3.88-1.38-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.72 1.26 3.39.96.11-.75.41-1.26.75-1.55-2.55-.29-5.23-1.28-5.23-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.21-1.5 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.44-2.69 5.41-5.25 5.69.42.36.8 1.08.8 2.18 0 1.57-.01 2.83-.01 3.22 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.66 18.35.5 12 .5z" />
                          </svg>
                        </a>

                        <a
                          href={`mailto:${p.email}`}
                          aria-label={`Email ${p.name}`}
                          className="p-2 rounded-md bg-white/4 hover:bg-white/8 transition-colors text-rose-300"
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

          <section className="bg-gradient-to-b from-white/3 to-white/2 rounded-xl p-5 sm:p-6">
            <h2 className="text-sm font-medium text-gray-200">Get in touch</h2>
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
                    href="https://github.com/tarek-aaraichi/movieshop-app"
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
                Want faster support or to contribute? Open an issue or pull request on
                GitHub and tag the team — we usually respond within a few business days.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
