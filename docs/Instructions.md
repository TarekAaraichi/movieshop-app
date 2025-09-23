# MovieShop Technical Specification&#x20;

<!--
  Project instructions and setup notes.
-->

## Project Overview

MovieShop is an e-commerce platform for purchasing and managing movies. The project will be developed by teams of 4–5 students.&#x20;

## Tech Stack

- **Next.js 15** with **App Router**
- **PostgreSQL**
- **Prisma** (ORM)
- **Tailwind CSS** (Styling)
- **ShadCN** (UI components)
- **Zod** (Data validation)
- **Better Auth** (Authentication)

  - Implement user registration and login using Better Auth
  - Utilize Better Auth’s default schema for user data
  - Integrate Better Auth components for user authentication UI&#x20;

## Core Features&#x20;

### 1) User Authentication

- Implement registration and login with **Better Auth**
- Create user roles: **Customer** and **Admin** (optional)&#x20;

### 2) Movie Management (Admin)

- **CRUD** operations for movies:

  - Add new movies with details (title, description, price, release date, director, actors, etc.)
  - Edit existing movie information
  - Delete movies
  - List all movies with pagination (pagination optional)

- **Movie genre management**:

  - CRUD operations for genres
  - Assign movies to multiple genres

- **People management** (directors and actors):

  - Add and edit information about directors and actors
  - Associate people with movies in different roles (director, actor)&#x20;

### 3) Shopping Experience (Customer)

- **Landing page** sections:

  - Top 5 most purchased movies
  - Top 5 most recent movies
  - Top 5 oldest movies
  - Top 5 cheapest movies

- **Browse movies** (optional filtering):

  - By genre
  - By director
  - By actor

- **Search**: basic search by title
- **Movie details** page
- **Cart**:

  - Add movies to cart (**stored in cookies**)
  - Manage cart (add, remove, update quantities)

- **Checkout**:

  - Address input
  - Payment simulation (no real gateway)
  - Order confirmation&#x20;

### 4) User Dashboard

- View **order history**
- Manage account information (optional)&#x20;

### 5) Admin Dashboard (optional)

- View **sales statistics**
- Manage **user accounts** (using Better Auth features)&#x20;

## Database Models (examples of potential properties)

> Note: These are example fields, not a full schema.&#x20;

- **Movie**: `title`, `description`, `price`, `releaseDate`, `imageUrl`, `stock`, `runtime`
- **Genre**: `name`, `description`
- **Order**: `userId` (reference to Better Auth user), `totalAmount`, `status`, `orderDate`
- **OrderItem**: `orderId`, `movieId`, `quantity`, `priceAtPurchase`
- **All Better Auth models**: utilize Better Auth for user-related actions (registration, login, profile updates)&#x20;

## Server Actions & Data Validation

- Implement **server actions** for all data mutations:

  - Movie CRUD
  - Genre management
  - Cart operations (add, remove, update)
  - Checkout process
  - Order management

- Use **Zod** for **server-side data validation** within server actions&#x20;

## Cart Implementation

- Use **cookies** to store cart information
- Implement functions to **add**, **remove**, and **update** cart items in the cookie&#x20;

## Frontend

- Develop **responsive layouts** using Tailwind CSS and ShadCN components
- Create **reusable React components** for common UI elements
- Use **React Server Components** where appropriate for improved performance&#x20;

## Additional Features (only if there's extra time)&#x20;

1. **Advanced browsing & filtering**

   - More complex filters (e.g., release year range, runtime, multiple genres)

2. **User reviews & ratings**

   - Customers can rate/review purchased movies; display average ratings on listings

3. **Wishlist**

   - Users can add movies for future purchase

4. **Basic recommendation system**

   - Based on purchase history, favorite genres, directors, or actors

5. **Movie trailer integration**

   - Link and display trailers (embedded YouTube videos)

6. **Social sharing**

   - Buttons to share movie links on social media

7. **Advanced search**

   - PostgreSQL full-text search; include search by director, actor, and genre

8. **Discount system**

   - Simple discounts for special offers or promotional codes

## Evaluation Criteria

- **Functionality**: All core features working as specified
- **Code Quality**: Clean, well-organized, and commented code
- **Database Design**: Proper use of Prisma and efficient schema, including correct integration with Better Auth user schema
- **UI/UX**: Intuitive and responsive design using Tailwind and ShadCN
- **Authentication**: Secure implementation of user authentication and authorization
- **Server Actions**: Efficient and secure implementation for data mutations
- **Data Validation**: Proper use of Zod for server-side validation
- **Cart Implementation**: Correct use of cookies for cart management
- **Error Handling**: Robust error handling and user feedback
- **Additional Features**: Successful implementation of extras (if attempted; not required)
- **Teamwork**: Effective collaboration and task distribution&#x20;
