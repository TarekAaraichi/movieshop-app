# ERD – MovieShop Database

```mermaid
erDiagram
  Movie ||--|{ OrderItem : contains
  Order ||--|{ OrderItem : contains
  Movie ||--o{ MovieGenre : has
  Genre ||--o{ MovieGenre : categorizes
  Movie ||--o{ MoviePerson : features
  Person ||--o{ MoviePerson : appears_in
  Order ||--o{ Address : ships_to
  Cart  ||--|{ CartItem : contains
  Movie ||--o{ CartItem : available_in

  Movie {
    string id PK
    string title
    string description
    decimal price
    datetime releaseDate
    string imageUrl
    int stock
    int runtime
    datetime createdAt
    datetime updatedAt
    boolean isArchived
  }

  Genre {
    string id PK
    string name
  }

  MovieGenre {
    string movieId FK
    string genreId FK
  }

  Person {
    string id PK
    string fullName
    string bio
    string imageUrl
  }

  MoviePerson {
    string movieId FK
    string personId FK
    string role
  }

  Order {
    string id PK
    string userId
    decimal totalAmount
    string status
    datetime orderDate
<<<<<<< HEAD
    string addressId
=======
    string userId
    string addressId FK?
>>>>>>> 2cf768d7ae44327009b1cffbc9067b94b317d18c
  }

  OrderItem {
    string orderId FK
    string movieId FK
    int quantity
    decimal priceAtPurchase
  }

  Address {
    string id PK
    string userId
    string line1
    string line2
    string city
    string postalCode
    string country
  }

  Cart {
    string id PK
<<<<<<< HEAD
    string userId
=======
    string userId?
>>>>>>> 2cf768d7ae44327009b1cffbc9067b94b317d18c
  }

  CartItem {
    string cartId FK
    string movieId FK
    int quantity
  }
```

Notes:

<<<<<<< HEAD
- Primary keys and composite keys (documented here because Mermaid's ER syntax doesn't support composite-key declarations):

  - MovieGenre composite PK = (movieId, genreId)
  - MoviePerson composite PK = (movieId, personId, role)
  - OrderItem composite PK = (orderId, movieId)
  - CartItem composite PK = (cartId, movieId)

- Optional fields (nullable in Prisma) have been placed in the Notes rather than using `?` in the diagram text because GitHub's Mermaid parser rejects `?` in attributes. Optional fields include:

  - Movie.imageUrl, Movie.runtime
  - Movie.isArchived (boolean flag)
  - Order.addressId
  - Address.line2
  - Cart.userId (nullable; unique when present)

- `Genre.name` and `Person.fullName` are unique.
- `Order.userId` and `Address.userId` are plain strings referencing external user IDs managed by the auth system (Better Auth). There is intentionally no Prisma `User` model relation in this schema.
- Indexes present in the Prisma schema: `@@index([userId])` on `Order` and `Address`.

Rendering notes:

- GitHub's mermaid in Markdown does not accept `?` or `@@id(...)` tokens inside ER attribute lists — use plain attribute names/types and document optional/composite information in Notes (as done above).
- If you want a rendered PNG/SVG included in the repo, I can generate one and add it under `docs/`.

If you'd like any further adjustments (simplified ERD, only public-facing tables, or a PNG output), tell me which models to include and I will produce it.
=======
- Auth is handled externally (better-auth). User-related models are intentionally omitted — we store user IDs as plain strings on Order, Address, and Cart.
- Enums (from Prisma): PersonRole (DIRECTOR | ACTOR), OrderStatus (PENDING | PAID | CANCELLED).
- Composite/compound primary keys:
  - MovieGenre: (movieId, genreId)
  - MoviePerson: (movieId, personId, role)
  - OrderItem: (orderId, movieId)
  - CartItem: (cartId, movieId)
- Important referential behaviors:
  - MovieGenre and MoviePerson: onDelete: Cascade (deleting a Movie or Person/Genre removes link rows).
  - OrderItem.order: onDelete: Cascade (deleting an Order removes its items).
  - OrderItem.movie and CartItem.movie: onDelete: Restrict (prevent deleting a Movie that's referenced in orders/carts).
  - Order.address: onDelete: SetNull (address can be removed without deleting the order).
- Field details:
  - Money fields use Decimal(10,2) precision in DB (price, totalAmount, priceAtPurchase).
  - Movie.createdAt defaults to now(); Movie.updatedAt is updatedAt.
  - Movie.imageUrl, Movie.runtime, Person.bio/imageUrl, Cart.userId, Address.line2, Order.addressId are optional per schema.
  - Cart.userId is unique (one cart per user when present).
- Recommended actions after schema change:
  - npx prisma migrate dev
  - npx prisma generate
  - npm run seed (if needed)
  - Optionally export this Mermaid diagram to PNG/SVG for docs.
>>>>>>> 2cf768d7ae44327009b1cffbc9067b94b317d18c
