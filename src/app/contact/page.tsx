export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-800">
      <div className="p-6 font-sans max-w-3xl mx-auto leading-relaxed text-gray-800 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Contact Us</h1>
        <p className="text-base text-gray-600 mb-4 ">
          Welcome to the contact page of Team Delta!
        </p>
        <h2 className="text-1xl font-bold text-blue-600 mt-5 mb-2">Our Team</h2>
        <ul className="list-none m-2 space-y-2 border-gray-200 dark:border-gray-800 shadow-sm bg-gradient-to-r from-white to-indigo-50 dark:from-transparent dark:via-gray-900 dark:to-gray-800 p-4 rounded-lg">
          <li className="flex items-center justify-between ">
            <span className="text-base font-bold text-gray-600">Tarek Aaraichi</span>
            <span className="flex items-center space-x-3">
              <a
          href="https://www.linkedin.com/in/tarek-aaraichi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:opacity-80"
          aria-label="Tarek Aaraichi on LinkedIn"
          title="LinkedIn"
              >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
          className="text-gray-800 hover:opacity-80"
          aria-label="Tarek Aaraichi on GitHub"
          title="GitHub"
              >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.38-3.88-1.38-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.72 1.26 3.39.96.11-.75.41-1.26.75-1.55-2.55-.29-5.23-1.28-5.23-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.21-1.5 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.44-2.69 5.41-5.25 5.69.42.36.8 1.08.8 2.18 0 1.57-.01 2.83-.01 3.22 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.66 18.35.5 12 .5z" />
          </svg>
              </a>
              <a
          href="mailto:tarek@example.com"
          className="text-gray-600 hover:opacity-80"
          aria-label="Email Tarek Aaraichi"
          title="Email"
              >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="red"
            aria-hidden="true"
          >
            <path d="M12 13.065L.75 4.5V19.5A2.25 2.25 0 0 0 3 21.75h18A2.25 2.25 0 0 0 23.25 19.5V4.5L12 13.065zM12 10.935L23.25 2.25H.75L12 10.935z" />
          </svg>
              </a>
            </span>
          </li>

          <li className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-600">Johan Skaneby</span>
            <span className="flex items-center space-x-3">
              <a
          href="https://www.linkedin.com/in/johan-skaneby"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:opacity-80"
          aria-label="Johan Skaneby on LinkedIn"
          title="LinkedIn"
              >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
          className="text-gray-800 hover:opacity-80"
          aria-label="Johan Skaneby on GitHub"
          title="GitHub"
              >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.38-3.88-1.38-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.72 1.26 3.39.96.11-.75.41-1.26.75-1.55-2.55-.29-5.23-1.28-5.23-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.21-1.5 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.44-2.69 5.41-5.25 5.69.42.36.8 1.08.8 2.18 0 1.57-.01 2.83-.01 3.22 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.66 18.35.5 12 .5z" />
          </svg>
              </a>
              <a
          href="mailto:johan@example.com"
          className="text-gray-600 hover:opacity-80"
          aria-label="Email Johan Skaneby"
          title="Email"
              >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="red"
            aria-hidden="true"
          >
            <path d="M12 13.065L.75 4.5V19.5A2.25 2.25 0 0 0 3 21.75h18A2.25 2.25 0 0 0 23.25 19.5V4.5L12 13.065zM12 10.935L23.25 2.25H.75L12 10.935z" />
          </svg>
              </a>
            </span>
          </li>

          <li className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-600">Josef Rega</span>
            <span className="flex items-center space-x-3">
              <a
          href="https://www.linkedin.com/in/josef-rega"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:opacity-80"
          aria-label="Josef Rega on LinkedIn"
          title="LinkedIn"
              >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
          className="text-gray-800 hover:opacity-80"
          aria-label="Josef Rega on GitHub"
          title="GitHub"
              >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.38-3.88-1.38-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.72 1.26 3.39.96.11-.75.41-1.26.75-1.55-2.55-.29-5.23-1.28-5.23-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.21-1.5 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.44-2.69 5.41-5.25 5.69.42.36.8 1.08.8 2.18 0 1.57-.01 2.83-.01 3.22 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.66 18.35.5 12 .5z" />
          </svg>
              </a>
              <a
          href="mailto:josef@example.com"
          className="text-gray-600 hover:opacity-80"
          aria-label="Email Josef Rega"
          title="Email"
              >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="red"
            aria-hidden="true"
          >
            <path d="M12 13.065L.75 4.5V19.5A2.25 2.25 0 0 0 3 21.75h18A2.25 2.25 0 0 0 23.25 19.5V4.5L12 13.065zM12 10.935L23.25 2.25H.75L12 10.935z" />
          </svg>
              </a>
            </span>
          </li>
        </ul>
        <h2 className="text-1xl font-bold text-blue-600 mt-5 mb-2">
          Contact Information
        </h2>
        <p className="text-base text-gray-600">
          If you have any questions, feel free to reach out to us!
        </p>
      </div>
    </div>
  );
}
