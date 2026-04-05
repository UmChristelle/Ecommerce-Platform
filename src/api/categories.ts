import api from "./axios";
import type { Category } from "../types";
import type { CategoryFormData } from "../utils/validators";

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get("/api/categories");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const createCategory = async (payload: CategoryFormData): Promise<Category> => {
  const { data } = await api.post("/api/categories", payload);
  return data?.data ?? data;
};

export const updateCategory = async (id: string, payload: CategoryFormData): Promise<Category> => {
  const { data } = await api.put(`/api/categories/${id}`, payload);
  return data?.data ?? data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/api/categories/${id}`);
};