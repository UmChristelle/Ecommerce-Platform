
export type UserRole = "ADMIN" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  stock: number;
  images: string[];
  category: Category;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  brand: string;
  stock: number;
  images: string[];
  categoryId: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod =
  | "CREDIT_CARD"
  | "PAYPAL"
  | "MOBILE_MONEY"
  | "CASH_ON_DELIVERY";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  city: string;
  postalCode?: string;
  phoneNumber: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutFormData {
  fullName: string;
  shippingAddress: string;
  city: string;
  postalCode?: string;
  phoneNumber: string;
  email: string;
  paymentMethod: PaymentMethod;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}