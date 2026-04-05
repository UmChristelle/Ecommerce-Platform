import api from "./axios";
import type { Order, OrderStatus } from "../types";

export const createOrder = async (payload: any): Promise<Order> => {
  const { data } = await api.post("/api/auth/orders", payload);
  return data?.data ?? data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const { data } = await api.get("/api/auth/orders");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getAllOrders = async (): Promise<Order[]> => {
  const { data } = await api.get("/api/auth/orders/admin/all");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const { data } = await api.patch(`/api/auth/orders/${id}/status`, { status });
  return data?.data ?? data;
};