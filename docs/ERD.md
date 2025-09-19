# ERD – MovieShop Database (generated from prisma/schema.prisma)

```mermaid
erDiagram
  Movie ||--o{ MovieGenre : "has"
  Genre ||--o{ MovieGenre : "categorizes"
  Movie ||--o{ MoviePerson : "has"
  Person ||--o{ MoviePerson : "appears_in"

  Order ||--|{ OrderItem : "contains"
  Movie ||--|{ OrderItem : "purchased"

  Address ||--o{ Order : "used_by"
  Cart ||--o{ CartItem : "contains"
  Movie ||--o{ CartItem : "in"

  Movie {
    string id PK
    string title
    string description
    decimal price
    datetime releaseDate
    string imageUrl
    int stock
    int runtime
    bool isArchived
    datetime createdAt
    datetime updatedAt
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
    decimal totalAmount
    string status
    datetime orderDate
    string userId        // external auth user id (no relation)
    string addressId FK?
  }

  OrderItem {
    string orderId FK
    string movieId FK
    int quantity
    decimal priceAtPurchase
  }

  Address {
    string id PK
    string userId        // external auth user id (no relation)
    string line1
    string line2
    string city
    string postalCode
    string country
  }

  Cart {
    string id PK
    string userId?       // optional unique external auth user id
  }

  CartItem {
    string cartId FK
    string movieId FK
    int quantity
  }
```

## Notes

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
