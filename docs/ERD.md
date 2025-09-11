# ERD – MovieShop Database

```mermaid
erDiagram
  Orders ||--|{ OrderItems : contains
  Movies ||--|{ OrderItems : purchased
  Movies ||--o{ MovieGenres : has
  Genres ||--o{ MovieGenres : categorizes
  Orders ||--|| Addresses : uses

  Movies {
    string id PK
    string title
    string description
    string director
    decimal price
    date releaseDate
    string imageUrl
    int stock
    int runtime
    datetime createdAt
    datetime updatedAt
  }

  Genres {
    string id PK
    string name
    string description
  }

  MovieGenres {
    string movieId FK
    string genreId FK
  }

  Orders {
    string id PK
    string userId FK
    decimal totalAmount
    string status
    datetime orderDate
  }

  OrderItems {
    string orderId FK
    string movieId FK
    int quantity
    decimal priceAtPurchase
  }

  Addresses {
    string id PK
    string orderId FK
    string line1
    string line2
    string city
    string postalCode
    string country
  }
```

**Notes:**
- `MovieGenres`: composite primary key = (movieId, genreId)  
- `OrderItems`: composite primary key = (orderId, movieId)  
- `Orders.userId` references Better Auth User table
- `Addresses` are in a separate table to avoid duplicating data, support multiple addresses per user, and ensure orders always reference the correct shipping address even if the user updates their saved addresses later.
