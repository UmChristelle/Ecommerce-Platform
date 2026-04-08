# E-Comus - E-Commerce Platform

A TypeScript e-commerce frontend built with React, Vite, TanStack Query, React Hook Form, and Zod. The app includes a storefront for shoppers and a role-protected admin dashboard for inventory, categories, and order management.

## Repository

GitHub: https://github.com/UmChristelle/Ecommerce-Platform

## Live Deployment

(https://ecommerce-platform-sandy-ten.vercel.app/)]

## Admin Login

- Email: `admin@admin.com`
- Password: `admin123`

## Features

- Public storefront with product catalog, search, category filtering, and product details
- Shopper authentication, persistent sessions, cart management, checkout, and order history
- Admin-only dashboard for products, categories, and order status updates
- Client-side validation with Zod and React Hook Form
- Cached server state with TanStack Query
- SPA routing support for deployment refreshes via [`vercel.json`](/c:/Users/educa/ecommerce-platform/vercel.json)

## Local Setup

```bash
git clone https://github.com/UmChristelle/Ecommerce-Platform.git
cd ecommerce-platform
npm install
npm run dev
```

Create a `.env` file if you want to override API settings locally. The current frontend is already configured to use the provided production API.

## Production Build

```bash
npm run build
npm run preview
```

## Assignment Notes

- Axios version is pinned to `1.14.0`, which stays within the safe version range from the assignment.
- Admin and shopper flows are wired to the provided backend API rather than using a fake local-only session.
- Vercel SPA rewrites are configured so direct refreshes on routes like `/admin` and `/products/:id` resolve back to the app shell.
