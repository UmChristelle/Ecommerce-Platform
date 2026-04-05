import api from "./axios";
import type { Product } from "../types";

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await api.get("/api/public/products");
  // Response: { success, data: { data: [...], pagination } } or { data: [...] }
  if (data?.data?.data) return data.data.data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await api.get(`/api/public/products/${id}`);
  return data?.data ?? data;
};

export const createProduct = async (payload: any): Promise<Product> => {
  const { data } = await api.post("/api/admin/products", payload);
  return data?.data ?? data;
};

export const updateProduct = async (id: string, payload: any): Promise<Product> => {
  const { data } = await api.patch(`/api/admin/products/${id}`, payload);
  return data?.data ?? data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/products/${id}`);
};