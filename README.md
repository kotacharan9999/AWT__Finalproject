# ShopEase - Premium E-Commerce Application

## Definition of Project (Problem Statement and Functional Requirements)

### Problem Statement
In the fast-growing e-commerce landscape, small and medium enterprises (SMEs) often struggle to provide users with a premium, robust, and reliable online shopping experience comparable to major industry players. Challenges include ensuring responsive modern UIs, maintaining secure state (carts and wishlists), building a scalable backend with smooth third-party payment integrations, and managing orders transparently so that buyers know exactly when their items will arrive. ShopEase aims to bridge this gap by delivering a visually stunning, responsive, and secure full-stack Web application tailored for an elite digital shopping experience.

### Functional Requirements

1. **Frontend Design & Development**
   - Provide a fully responsive, React component-based user interface using modern design aesthetics (glassmorphism, subtle animations, dark mode support).
   - Route pages dynamically using React-Router-DOM (Home, Products, Product Details, Cart, Checkout, Auth, User Profile, Admin Dashboard).
   - Deliver engaging user interactions with toast notifications, a cart drawer, and client-side form validation.

2. **Backend Development & Database**
   - Host robust Node.js/Express REST APIs to handle data fetching and mutation seamlessly.
   - Design secure MongoDB schemas using Mongoose for entities like Users, Products, Reviews, and Orders.
   - Implement complex CRUD operations including inserting user state, fetching user orders, retrieving/posting product reviews, and querying products with server-side pagination.
   - Integrate automated real-time services such as Stripe for processing payments and Nodemailer for sending automated customer email receipts.

3. **Authentication & Security Implementation**
   - Support user registration and login securely. Provide users with JWT tokens upon successful login to authenticate requests natively.
   - Require valid JWT tokens embedded in the Authorization header to protect sensitive backend routes.
   - Hash passwords at rest using internal `bcryptjs` libraries.
   - Implement Role-Based Access Control (RBAC), enabling exclusive administrative pages where owners can manage global order status while standard users interact strictly with their own sandboxed data.
   - Abstract sensitive information (like JWT secrets, Stripe Keys, MONGODB URI, and encryption keys) using `.env` variables.

## Run the App Locally

1. Copy the backend example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Install dependencies from the project root:
   ```bash
   cd ..
   npm install
   ```
3. Seed the database with products:
   ```bash
   npm run seed
   ```
4. Start the full stack app:
   ```bash
   npm run start
   ```

This starts the backend on `http://localhost:5000` and the React frontend on `http://localhost:3000`.

## Admin Login

- Email: `kotareddy9848@gmail.com`
- Password: `kotareddy9848`

The backend now auto-creates this admin account on startup and refreshes it with these credentials.
For production, you can override them with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in your backend environment.
