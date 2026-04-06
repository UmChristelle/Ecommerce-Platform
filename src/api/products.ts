import api from "./axios";
import type { Product } from "../types";
import { normalizeProductResponse, normalizeProductsResponse } from "./normalizers";

const toProductPayload = (payload: Record<string, unknown>) => ({
  name: payload.title,
  description: payload.description,
  categoryId: payload.categoryId,
  brand: payload.brand,
  price: payload.price,
  stock: payload.stock,
  images: Array.isArray(payload.images)
    ? payload.images.map((image) =>
        typeof image === "string"
          ? {
              url: image,
              format: image.split(".").pop()?.toUpperCase() || "JPG",
              size: 0,
            }
          : image
      )
    : [],
});

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get("/api/public/products");
  return normalizeProductsResponse(data);
};

export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await api.get(`/api/public/products/${id}`);
  return normalizeProductResponse(data);
};

export const createProduct = async (payload: Record<string, unknown>): Promise<Product> => {
  const { data } = await api.post("/api/admin/products", toProductPayload(payload));
  return normalizeProductResponse(data);
};

export const updateProduct = async (id: string, payload: Record<string, unknown>): Promise<Product> => {
  const { data } = await api.patch(`/api/admin/products/${id}`, toProductPayload(payload));
  return normalizeProductResponse(data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/products/${id}`);
};
