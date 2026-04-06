import api from "./axios";
import type { Order, OrderStatus } from "../types";
import { normalizeOrderResponse, normalizeOrdersResponse } from "./normalizers";

export const createOrder = async (payload: Record<string, unknown>): Promise<Order> => {
  const { data } = await api.post("/api/auth/orders", payload);
  return normalizeOrderResponse(data);
};

export const getMyOrders = async (): Promise<Order[]> => {
  const { data } = await api.get("/api/auth/orders");
  return normalizeOrdersResponse(data);
};

export const getAllOrders = async (): Promise<Order[]> => {
  const { data } = await api.get("/api/auth/orders/admin/all");
  return normalizeOrdersResponse(data);
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const { data } = await api.patch(`/api/auth/orders/${id}/status`, { status });
  return normalizeOrderResponse(data);
};
