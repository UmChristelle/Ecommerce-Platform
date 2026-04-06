import api from "./axios";
import type { Product } from "../types";
import { normalizeProductResponse, normalizeProductsResponse } from "./normalizers";

const getImageFormat = (imageUrl: string): "JPG" | "JPEG" | "PNG" | "WEBP" => {
  try {
    const pathname = new URL(imageUrl).pathname;
    const extension = pathname.split(".").pop()?.toUpperCase();

    if (extension === "PNG") return "PNG";
    if (extension === "WEBP") return "WEBP";
    if (extension === "JPEG") return "JPEG";
    if (extension === "JPG") return "JPG";
  } catch {
    const sanitized = imageUrl.split("?")[0].split("#")[0];
    const extension = sanitized.split(".").pop()?.toUpperCase();

    if (extension === "PNG") return "PNG";
    if (extension === "WEBP") return "WEBP";
    if (extension === "JPEG") return "JPEG";
    if (extension === "JPG") return "JPG";
  }

  return "JPG";
};

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
              format: getImageFormat(image),
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
