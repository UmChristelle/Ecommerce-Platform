import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").refine(v => v.trim() !== "", "Name cannot be empty"),
  email: z.string().email("Must be a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const productSchema = z.object({
  title: z.string().min(1, "Title is required").refine(v => v.trim() !== "", "Cannot be empty spaces"),
  description: z.string().min(20, "Description must be at least 20 characters").refine(v => v.trim() !== "", "Cannot be empty spaces"),
  brand: z.string().min(1, "Brand is required").refine(v => v.trim() !== "", "Cannot be empty spaces"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string().url("Must be a valid URL")).min(1, "At least one image URL is required"),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(1, "Full name is required").refine(v => v.trim() !== "", "Cannot be empty"),
  shippingAddress: z.string().min(1, "Shipping address is required").refine(v => v.trim() !== "", "Cannot be empty"),
  city: z.string().min(1, "City is required").refine(v => v.trim() !== "", "Cannot be empty"),
  postalCode: z.string().optional(),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string().email("Must be a valid email address"),
  paymentMethod: z.enum(["CREDIT_CARD", "PAYPAL", "MOBILE_MONEY", "CASH_ON_DELIVERY"]),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").refine(v => v.trim() !== "", "Cannot be empty"),
  description: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;