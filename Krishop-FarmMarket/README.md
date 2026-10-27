# KriShop

KriShop is a modern e-commerce application built with Next.js 16 and MongoDB. It features a comprehensive shopping experience with role-based dashboards for users, vendors, and admins.

## Features

-   **Authentication**: Secure login and registration using NextAuth.js.
-   **Role-Based Access**: Specialized dashboards for different user roles:
    -   **User**: Browse products, manage cart, view order history.
    -   **Vendor**: Manage own products and sales.
    -   **Admin**: Full system oversight, manage users, products, and orders.
-   **Product Management**: Browse, search, and view product details. Admins and Vendors can create, update, and delete products.
-   **Shopping Cart**: Real-time cart management with add/remove functionality.
-   **Checkout & Payment**: Integrated checkout flow (SSLCommerz) with payment success/failure handling.
-   **Responsive Design**: Built with Tailwind CSS for a mobile-first, responsive interface.

## Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: JavaScript
-   **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose ODM)
-   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Notifications**: React Toastify & SweetAlert2

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18 or later recommended)
-   MongoDB Database (local or Atlas)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/krishop.git
    cd krishop
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**

    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    MONGO_DB_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_nextauth_secret_key
    NEXTAUTH_URL=http://localhost:3000

    # Store ID and Password for Payment Gateway (if applicable)
    STORE_ID=your_store_id
    STORE_Pass=your_store_password
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

-   `app/`: Main application code (App Router).
    -   `api/`: Backend API routes.
    -   `dashboard/`: Role-based dashboard pages.
    -   `login/` & `register/`: Authentication pages.
-   `Components/`: Reusable UI components (Header, Cart, ProductCard, etc.).
-   `Model/`: Mongoose data models (User, Product, CartModel).
-   `utils/`: Utility functions (Database connection, helper scripts).

## Scripts

-   `npm run dev`: Runs the development server with Turbopack.
-   `npm run build`: Builds the application for production.
-   `npm start`: Starts the production server.
-   `npm run lint`: Runs ESLint for code quality.
