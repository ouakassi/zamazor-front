# Zamazor Front

Modern supplement ecommerce frontend built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, and Zustand.

The app includes a polished storefront, authenticated user flows, a profile area, and an admin dashboard for managing products, categories, and orders.

## Features

- Modern supplement homepage with animated sections and category-driven merchandising
- Storefront with backend-backed product browsing, filtering, sorting, pagination, cart, checkout, and wishlist support
- Authentication flows for login, register, refresh, and sign out
- User profile page with editable shipping address and order history
- Admin dashboard at `/dashboard` for overview, products, categories, and orders
- Shared API endpoint map for easier backend integration changes
- Form validation with Zod and React Hook Form
- Toast notifications with Sonner
- Motion polish with Framer Motion

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- shadcn/ui
- Framer Motion
- Zustand
- React Router
- Axios
- Zod

## Project Structure

```txt
src/
  core/
    config/          app constants, API endpoints, and product metadata
    routes/          route definitions and path constants
  features/
    auth/            auth services, schemas, stores, and helpers
    addresses/       address service and formatting helpers
    cart/            cart service logic
    orders/          checkout schemas, order service, and status constants
    products/        product service, wishlist service, and stores
  pages/
    public/          home, shop, cart, checkout, login, register, wishlist, product detail
    dashboard/       overview, products, categories, orders, dashboard layout
  shared/
    components/      reusable UI and layout components
    context/         language context
    hooks/           shared React hooks
    layouts/         app layouts
    utils/           shared utilities
```

## Routes

- `/` home
- `/shop` store
- `/cart` cart
- `/checkout` checkout
- `/profile` profile
- `/wishlist` wishlist
- `/dashboard` admin overview
- `/dashboard/products` products management
- `/dashboard/categories` categories management
- `/dashboard/orders` orders management

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Zamazor
```

### 3. Start the app

```bash
npm run dev
```

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

- The frontend expects a backend API for authentication, products, categories, carts, addresses, wishlists, and orders.
- Dashboard and storefront pagination are designed to work with backend pagination where available.
- Category selection in the admin products view must use the category ID, not the label.

