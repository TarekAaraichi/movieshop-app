export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100 px-4">
      <div className="p-6 font-sans max-w-3xl mx-auto leading-relaxed text-gray-800 bg-white/95 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact</h1>
        <p className="text-base text-gray-700 mb-4">
          We&apos;d love to hear from you. For questions about the demo,
          contributions, or feature requests, reach out to the team via email or
          follow us on GitHub.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mt-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Team</h2>
            <ul className="space-y-3">
              <li className="space-y-1">
                <div>
                  <strong className="block text-gray-900">
                    Tarek Aaraichi
                  </strong>
                  <div className="text-xs text-gray-500">
                    Frontend / Integrations
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <a
                      href="https://www.linkedin.com/in/tarek-aaraichi"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Tarek on LinkedIn"
                      className="text-blue-600 hover:opacity-80"
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
                      href="https://github.com/tarek-aaraichi"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Tarek on GitHub"
                      className="text-gray-800 hover:opacity-80"
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
                      href="mailto:tarek@example.com"
                      aria-label="Email Tarek"
                      className="text-red-500 hover:opacity-80"
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
              </li>

              <li className="space-y-1">
                <div>
                  <strong className="block text-gray-900">Johan Skaneby</strong>
                  <div className="text-xs text-gray-500">Backend / DB</div>
                  <div className="flex items-center space-x-3 mt-2">
                    <a
                      href="https://www.linkedin.com/in/johan-skaneby"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Johan on LinkedIn"
                      className="text-blue-600 hover:opacity-80"
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
                      href="https://github.com/johanskaneby"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Johan on GitHub"
                      className="text-gray-800 hover:opacity-80"
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
                      href="mailto:johan@example.com"
                      aria-label="Email Johan"
                      className="text-red-500 hover:opacity-80"
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
              </li>

              <li className="space-y-1">
                <div>
                  <strong className="block text-gray-900">Josef Rega</strong>
                  <div className="text-xs text-gray-500">UX / Design</div>
                  <div className="flex items-center space-x-3 mt-2">
                    <a
                      href="https://www.linkedin.com/in/josef-rega"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Josef on LinkedIn"
                      className="text-blue-600 hover:opacity-80"
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
                      href="https://github.com/josefrega"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Josef on GitHub"
                      className="text-gray-800 hover:opacity-80"
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
                      href="mailto:josef@example.com"
                      aria-label="Email Josef"
                      className="text-red-500 hover:opacity-80"
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
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Get in touch
            </h2>
            <p className="text-sm text-gray-700">
              General:{" "}
              <a
                href="mailto:hello@movieshop.example"
                className="text-teal-600 hover:underline"
              >
                hello@movieshop.example
              </a>
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Code:{" "}
              <a
                href="https://github.com/tarek-aaraichi/movieshop-app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:underline"
              >
                GitHub repository
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
