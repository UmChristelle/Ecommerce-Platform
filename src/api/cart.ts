import api from "./axios";
import type { Cart } from "../types";

export const getCart = async (): Promise<Cart> => {
  const { data } = await api.get("/api/auth/cart");
  return data?.data ?? data;
};

export const addToCart = async (productId: string, quantity: number): Promise<Cart> => {
  const { data } = await api.post("/api/auth/cart/items", { productId, quantity });
  return data?.data ?? data;
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<Cart> => {
  const { data } = await api.patch(`/api/auth/cart/items/${itemId}`, { quantity });
  return data?.data ?? data;
};

export const removeCartItem = async (itemId: string): Promise<void> => {
  await api.delete(`/api/auth/cart/items/${itemId}`);
};

export const clearCart = async (): Promise<void> => {
  await api.delete("/api/auth/cart");
};