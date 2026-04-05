# E-Comus — E-Commerce Platform

A production-grade E-Commerce platform with a customer storefront and secure admin dashboard.

##  Live Demo
[Add your deployment URL here]

##  Admin Login (for grading)
- **Email:** admin@admin.com
- **Password:** admin123

##  Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router v6
- TanStack Query (React Query v5)
- React Hook Form + Zod
- Axios v1.14.0
- React Hot Toast

##  Local Setup
```bash
git clone <your-repo-url>
cd ecommerce-platform
npm install
npm run dev
```

##  Roles
- **Admin** → Static credentials above → redirected to `/admin`
- **User** → Register a new account → redirected to `/`

## Features
- Role-based protected routes (Admin / User / Guest)
- Product catalog with search & category filter
- Shopping cart with quantity management
- Multi-step checkout with Zod validation
- Admin dashboard: manage products, orders, categories
- TanStack Query caching + auto invalidation
- Fully responsive (mobile, tablet, desktop)