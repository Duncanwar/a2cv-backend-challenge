# E-Commerce REST API

A comprehensive REST API for an e-commerce platform built with Node.js, TypeScript, and Express. The platform allows users to manage product collections, place orders, and handle authentication with role-based access control.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Technology Choices](#technology-choices)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 16+ and npm (or yarn)
- **PostgreSQL** database (local)
- **Git** (for cloning the repository)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name?schema=public

# JWT Configuration
JWT_KEY=your-secret-jwt-key-here

# API Configuration (Optional)
API_BASE_URL=http://localhost:5000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Environment Variables Explained

- **PORT**: The port number on which the server will run (default: 5000)
- **NODE_ENV**: Environment mode (`development`, `production`, or `test`)
- **DATABASE_URL**: PostgreSQL connection string in the format: `postgresql://user:password@host:port/database?schema=public`
- **JWT_KEY**: Secret key used for signing and verifying JWT tokens (use a strong, random string in production)
- **API_BASE_URL**: Base URL for the API (optional, used for generating absolute URLs)
- **ALLOWED_ORIGINS**: Comma-separated list of allowed CORS origins (optional, defaults to allowing all in development)

## Local Setup

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd a2cv-backend-challenge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env  # If .env.example exists
   # Or create .env manually and add the variables listed above
   ```

4. **Set up the database**:
   - Create a PostgreSQL database
   - Update the `DATABASE_URL` in your `.env` file with your database credentials
   - Run Prisma migrations:
     ```bash
     npx prisma migrate dev
     ```
   - Generate Prisma Client:
     ```bash
     npm run prisma:generate
     # or
     npx prisma generate
     ```

5. **Verify the setup**:
   - Ensure all environment variables are set correctly
   - Verify database connection by checking the console output when starting the server

## Running the Project

### Development Mode

Run the server in development mode with auto-reload on file changes:

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

### Production Mode

1. **Build the TypeScript code**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

### Additional Commands

- **Generate Prisma Client**: `npm run prisma:generate`
- **Run Prisma Migrations**: `npx prisma migrate dev`
- **View Prisma Studio** (database GUI): `npx prisma studio`

## API Endpoints

The API is served under the `/api` prefix. A quick overview:

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Products (`/api/products`)
- `GET /api/products` - Get paginated list of products (public, supports search query)
- `GET /api/products/:id` - Get product details by ID (public)
- `POST /api/products` - Create a new product (Admin only)
- `PUT /api/products/:id` - Update a product (Admin only)
- `DELETE /api/products/:id` - Delete a product (Admin only)

### Orders (`/api/orders`)
- `POST /api/orders` - Place a new order (User role only)
- `GET /api/orders` - Get user's order history (Authenticated users)

## API Documentation

### Base URL

```
http://localhost:5000/api
```

Interactive documentation is available at:

- Swagger UI: `http://localhost:5000/api-docs`
- JSON spec: `http://localhost:5000/api-docs.json`

All responses follow this shape:

```json
{
  "success": true,
  "message": "Human readable text",
  "object": {},
  "errors": null
}
```

Paginated responses wrap data inside `object`:

```json
{
  "success": true,
  "message": "Products retrieved",
  "object": {
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 3,
    "totalProducts": 25,
    "products": []
  },
  "errors": null
}
```

### Authentication

#### `POST /auth/register`
- **Description**: Create a new user account
- **Auth**: Public
- **Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "P@ssw0rd!"
  }
  ```
- **Responses**:
  - `201 Created`
    ```json
    {
      "success": true,
      "message": "User created successfully",
      "object": {
        "user": {
          "id": "uuid",
          "email": "john@example.com",
          "username": "john_doe"
        }
      },
      "errors": null
    }
    ```
  - `400 Bad Request` on validation failure

#### `POST /auth/login`
- **Description**: Authenticate user and return JWT
- **Auth**: Public
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "P@ssw0rd!"
  }
  ```
- **Responses**:
  - `200 OK`
    ```json
    {
      "success": true,
      "message": "Login successful",
      "object": {
        "user": {
          "id": "uuid",
          "email": "john@example.com",
          "username": "john_doe"
        },
        "token": "jwt-token"
      },
      "errors": null
    }
    ```
  - `400 Bad Request` for invalid payload
  - `401 Unauthorized` for invalid credentials

### Products

#### `GET /products`
- **Description**: List products with pagination and optional search
- **Auth**: Public
- **Query Parameters**:
  - `page` (number, default `1`)
  - `limit` or `pageSize` (number, default `10`)
  - `search` (string, optional, case-insensitive)
- **Responses**:
  - `200 OK` with paginated structure shown above

#### `GET /products/:id`
- **Description**: Retrieve product details
- **Auth**: Public
- **Responses**:
  - `200 OK`
    ```json
    {
      "success": true,
      "message": "Product retrieved",
      "object": {
        "id": "uuid",
        "name": "Sample Product",
        "description": "Long text...",
        "price": 1999,
        "stock": 10,
        "category": "Electronics",
        "userId": "uuid",
        "createdAt": "2025-11-10T10:00:00.000Z",
        "updatedAt": "2025-11-10T10:00:00.000Z"
      },
      "errors": null
    }
    ```
  - `404 Not Found` if product does not exist

#### `POST /products`
- **Description**: Create a new product
- **Auth**: Bearer token, role `Admin`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Sample Product",
    "description": "Product description",
    "price": 1999,
    "stock": 20,
    "category": "Electronics"
  }
  ```
- **Responses**:
  - `201 Created` with created product
  - `400 Bad Request` on validation failure
  - `401/403` on unauthorized access

#### `PUT /products/:id`
- **Description**: Update selected product fields
- **Auth**: Bearer token, role `Admin`
- **Body** (all fields optional, same validation as create):
  ```json
  {
    "name": "Updated",
    "description": "Updated description",
    "price": 2499,
    "stock": 15,
    "category": "Accessories"
  }
  ```
- **Responses**:
  - `200 OK` with updated product
  - `400 Bad Request`, `404 Not Found`, `401/403` as appropriate

#### `DELETE /products/:id`
- **Description**: Remove a product
- **Auth**: Bearer token, role `Admin`
- **Responses**:
  - `200 OK` with success message
  - `404 Not Found` if product does not exist

### Orders

#### `POST /orders`
- **Description**: Place a new order
- **Auth**: Bearer token, role `User`
- **Body**:
  ```json
  [
    { "productId": "uuid-a", "quantity": 2 },
    { "productId": "uuid-b", "quantity": 1 }
  ]
  ```
- **Responses**:
  - `201 Created`
    ```json
    {
      "success": true,
      "message": "Order placed successfully",
      "object": {
        "id": "uuid",
        "userId": "uuid",
        "totalPrice": 4999,
        "status": "pending",
        "items": [
          {
            "id": "uuid",
            "productId": "uuid-a",
            "quantity": 2,
            "price": 1999,
            "product": {
              "id": "uuid-a",
              "name": "Sample Product",
              "description": "Product description",
              "category": "Electronics"
            }
          }
        ]
      },
      "errors": null
    }
    ```
  - `400 Bad Request` if stock is insufficient
  - `404 Not Found` if any productId is invalid

#### `GET /orders`
- **Description**: Retrieve the authenticated user's order history
- **Auth**: Bearer token (`User` or `Admin` role)
- **Responses**:
  - `200 OK`
    ```json
    {
      "success": true,
      "message": "Orders retrieved",
      "object": [
        {
          "id": "uuid",
          "status": "pending",
          "totalPrice": 4999,
          "createdAt": "2025-11-10T10:00:00.000Z"
        }
      ],
      "errors": null
    }
    ```
  - `200 OK` with empty array when no orders exist
  - `401 Unauthorized` if token missing or invalid

## Technology Choices

### Core Framework & Language
- **Node.js with TypeScript**: Provides type safety, better IDE support, and catches errors at compile time. TypeScript enhances code maintainability and reduces runtime errors in a production environment.

### Web Framework
- **Express.js 5.x**: A minimal, flexible Node.js web framework that provides robust routing, middleware support, and HTTP utilities. Express is battle-tested and has a large ecosystem of middleware.

### Database & ORM
- **PostgreSQL**: A powerful, open-source relational database with excellent performance, ACID compliance, and support for complex queries. Ideal for e-commerce applications requiring data integrity.
- **Prisma**: A modern ORM that provides type-safe database access, automatic migrations, and an intuitive query API. Prisma's type generation ensures compile-time safety and reduces database-related bugs.

### Authentication & Security
- **JWT (JSON Web Tokens)**: Stateless authentication mechanism that scales well and works seamlessly with REST APIs. JWTs eliminate the need for server-side session storage.
- **bcrypt**: Industry-standard password hashing library that provides secure password storage with salt rounds.

### Validation & Middleware
- **express-validator**: Provides robust request validation and sanitization, ensuring data integrity and preventing common security vulnerabilities like injection attacks.
- **express-rate-limit**: Protects the API from abuse and DDoS attacks by limiting the number of requests from a single IP.

### Development Tools
- **nodemon/ts-node**: Enables hot-reloading during development, improving developer productivity.
- **morgan**: HTTP request logger middleware for monitoring and debugging API requests.
- **CORS**: Enables cross-origin resource sharing for frontend applications.

### Code Quality
- **ESLint**: Enforces coding standards and catches potential bugs before runtime.
- **TypeScript**: Provides static type checking, improving code quality and developer experience.

### Why These Choices?

1. **TypeScript**: Reduces bugs through compile-time type checking and improves developer experience with autocomplete and refactoring tools.

2. **Prisma**: Simplifies database operations with type-safe queries, automatic migrations, and excellent developer experience. The generated client ensures type safety across the application.

3. **Express.js**: Mature, well-documented, and has extensive middleware ecosystem. Perfect for building REST APIs quickly while maintaining flexibility.

4. **PostgreSQL**: Reliable, performant, and supports complex relational data structures required for e-commerce (products, orders, users, relationships).

5. **JWT**: Stateless authentication that scales horizontally without requiring session storage, perfect for microservices and distributed systems.

This technology stack provides a solid foundation for building scalable, maintainable, and secure e-commerce APIs.
