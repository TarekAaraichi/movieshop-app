<!--
  FILE_SUMMARY: Short descriptions of important source files.
-->

# MovieShop — File Summary

Short descriptions of important source files. See `src/` for implementation details.

- `prisma/schema.prisma` — Database models (Movie, Genre, Person, Cart, CartItem, Order, auth models).
- `src/lib/prisma.ts` — Cached Prisma client singleton.
- `src/hooks/useCart.tsx` — Client cart hook; optimistic updates and POSTs to `/api/cart`.
- `src/app/api/cart/route.ts` — Server cart endpoint, canonical cart resolution and mutations.
- `src/app/movies/[movieId]/page.tsx` — Movie detail server page (poster, facts, cast, add-to-cart).
