// PostCSS configuration (CJS variant)
// CommonJS PostCSS config used by Webpack/PostCSS loader in Next.js (Webpack)
// This ensures the PostCSS Tailwind plugin is loaded from `@tailwindcss/postcss`.
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
