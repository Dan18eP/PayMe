import { create } from "zustand";
import { httpClient } from "../services/httpClient";

interface AuthState {
  user: { id: string; email: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("auth_token"),
  isAuthenticated: !!localStorage.getItem("auth_token"),
  isLoading: false,

  initialize: () => {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("auth_user");
    set({
      token,
      isAuthenticated: !!token,
      user: user ? JSON.parse(user) : null,
    });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const result = await httpClient.post<{
        user: { id: string; email: string };
        session: { access_token: string };
      }>("/auth/login", { email, password });

      localStorage.setItem("auth_token", result.session.access_token);
      localStorage.setItem("auth_user", JSON.stringify(result.user));
      set({
        user: result.user,
        token: result.session.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      await httpClient.post("/auth/register", { email, password });
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await httpClient.post("/auth/logout");
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
