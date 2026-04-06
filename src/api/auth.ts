import api from "./axios";
import type { AuthPayload } from "../types";
import { normalizeAuthResponse } from "./normalizers";

interface LoginPayload { email: string; password: string; }
interface RegisterPayload { email: string; password: string; role?: string; }

export const loginUser = async (payload: LoginPayload): Promise<AuthPayload> => {
  const { data } = await api.post("/api/auth/users/login", payload);
  return normalizeAuthResponse(data, payload.email);
};

export const registerUser = async (payload: RegisterPayload): Promise<AuthPayload> => {
  await api.post("/api/auth/users/register", payload);
  return loginUser({ email: payload.email, password: payload.password });
};
