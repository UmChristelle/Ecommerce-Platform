import api from "./axios";
import type { Cart } from "../types";
import { normalizeCartResponse } from "./normalizers";

const getApiErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const record = error as {
      message?: string;
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return String(record.response?.data?.message ?? record.message ?? "");
  }

  return "";
};

export const getCart = async (): Promise<Cart> => {
  const { data } = await api.get("/api/auth/cart");
  return normalizeCartResponse(data);
};

export const addToCart = async (
  productId: string,
  quantity: number,
  variantId?: string
): Promise<Cart> => {
  const payload = variantId ? { productId, variantId, quantity } : { productId, quantity };

  try {
    const { data } = await api.post("/api/auth/cart/items", payload);
    return normalizeCartResponse(data);
  } catch (error) {
    const message = getApiErrorMessage(error).toLowerCase();
    if (variantId && message.includes("variant not found")) {
      const { data } = await api.post("/api/auth/cart/items", { productId, quantity });
      return normalizeCartResponse(data);
    }
    throw error;
  }
};

export const updateCartItem = async (itemId: string, quantity: number, fallbackId?: string): Promise<Cart> => {
  try {
    const { data } = await api.patch(`/api/auth/cart/items/${itemId}`, { quantity });
    return normalizeCartResponse(data);
  } catch (error) {
    const message = getApiErrorMessage(error).toLowerCase();
    if (
      fallbackId &&
      fallbackId !== itemId &&
      (message.includes("cart item not found") || message.includes("not found"))
    ) {
      const { data } = await api.patch(`/api/auth/cart/items/${fallbackId}`, { quantity });
      return normalizeCartResponse(data);
    }
    throw error;
  }
};

export const removeCartItem = async (itemId: string, fallbackId?: string): Promise<void> => {
  try {
    await api.delete(`/api/auth/cart/items/${itemId}`);
  } catch (error) {
    const message = getApiErrorMessage(error).toLowerCase();
    if (
      fallbackId &&
      fallbackId !== itemId &&
      (message.includes("cart item not found") || message.includes("not found"))
    ) {
      await api.delete(`/api/auth/cart/items/${fallbackId}`);
      return;
    }
    throw error;
  }
};

export const clearCart = async (): Promise<void> => {
  await api.delete("/api/auth/cart");
};

export interface CartReplacementItem {
  productId: string;
  quantity: number;
  variantId?: string;
}

export const replaceCart = async (items: CartReplacementItem[]): Promise<Cart> => {
  await clearCart();

  let latestCart: Cart = {
    id: "",
    userId: "",
    items: [],
    total: 0,
    itemCount: 0,
  };

  for (const item of items) {
    if (!item.productId || item.quantity <= 0) continue;
    latestCart = await addToCart(item.productId, item.quantity, item.variantId);
  }

  return latestCart;
};
