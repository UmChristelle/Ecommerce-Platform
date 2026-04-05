import api from "./axios";
import type { User } from "../types";

interface LoginPayload { email: string; password: string; }
interface RegisterPayload { email: string; password: string; role?: string; }
interface AuthResponse { success: boolean; token: string; user: User; }

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await api.post("/api/auth/users/login", payload);
  return data;
};

export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await api.post("/api/auth/users/register", payload);
  return data;
};