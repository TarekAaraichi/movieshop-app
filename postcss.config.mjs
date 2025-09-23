// PostCSS configuration (Tailwind integration)
// Use explicit plugin names to avoid loading native bindings (lightningcss)
// that some environments may not have available. This keeps PostCSS setup
// compatible with Next/Turbopack dev runs.
// Use explicit plugin names to avoid loading native bindings (lightningcss)
// that some environments may not have available. Next.js now expects the
// PostCSS Tailwind plugin to be provided from `@tailwindcss/postcss`.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};

export default config;

// Note: some environments and older tooling may still expect a CommonJS
// `module.exports` export. If you see PostCSS complaining about no default
// export, add the following as a fallback (uncomment):
// module.exports = config;
