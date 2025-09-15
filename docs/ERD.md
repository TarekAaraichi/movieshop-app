# ERD – MovieShop Database (generated from prisma/schema.prisma)

```mermaid
erDiagram
  User ||--o{ Order : "places"
  Order ||--|{ OrderItem : "contains"
  Movie ||--|{ OrderItem : "purchased"

  Movie ||--o{ MovieGenre : "has"
  Genre ||--o{ MovieGenre : "categorizes"
  Movie ||--o{ MoviePerson : "has"
  Person ||--o{ MoviePerson : "appears_in"

  User ||--o{ Address : "owns"
  User ||--o{ Cart : "has"
  Cart ||--o{ CartItem : "contains"
  Movie ||--o{ CartItem : "in"

  User ||--o{ Session : "sessions"
  User ||--o{ Account : "accounts"

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
  }

  Genre {
    string id PK
    string name
    string description
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
    string userId FK
    string addressId FK
  }

  OrderItem {
    string orderId FK
    string movieId FK
    int quantity
    decimal priceAtPurchase
  }

  Address {
    string id PK
    string userId FK
    string line1
    string line2
    string city
    string postalCode
    string country
  }

  User {
    string id PK
    string email
    string password
    string name
    string role
    bool emailVerified
    string image
    datetime createdAt
    datetime updatedAt
  }

  Cart {
    string id PK
    string userId FK
  }

  CartItem {
    string id PK
    string cartId FK
    string movieId FK
    int quantity
  }

  Session {
    string id PK
    datetime expiresAt
    string token
    string userId FK
  }

  Account {
    string id PK
    string accountId
    string providerId
    string userId FK
  }

  Verification {
    string id PK
    string identifier
    string value
    datetime expiresAt
  }
```

## Notes

- Enums (from Prisma): `PersonRole` (DIRECTOR | ACTOR), `OrderStatus` (PENDING | PAID | CANCELLED)
- Composite keys: `MovieGenre` (movieId, genreId), `MoviePerson` (movieId, personId, role), `OrderItem` (orderId, movieId)
- Important relations: `MovieGenre`/`MoviePerson` cascade on delete; `OrderItem.movie` uses `onDelete: Restrict`
- Table mappings: `User` model mapped to DB table `user` (via `@@map`), Session/Account/Verification similarly mapped
- Money fields use `Decimal(10,2)` precision in DB

Recommended: run `npx prisma migrate dev` after schema changes and optionally export this Mermaid diagram to PNG/SVG for docs.
