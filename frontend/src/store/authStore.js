import { create } from "zustand";
import api from "../api/client.js";
export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  loadUser: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.user });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  login: async (details) => {
    const { data } = await api.post("/auth/login", details);
    set({ user: data.user });
    return data.user;
  },
  adminLogin: async (details) => {
    const { data } = await api.post("/auth/admin/login", details);
    set({ user: data.user });
    return data.user;
  },
  register: async (details) => {
    const { data } = await api.post("/auth/register", details);
    set({ user: data.user });
    return data.user;
  },
  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },
}));
