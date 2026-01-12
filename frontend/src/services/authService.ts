import apiClient from "../utils/apiClient";

export const authService = {
  login: async (data: {
    email: string;
    password: string;
    userName?: string;
  }) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },
  register: async (data: {
    email: string;
    password: string;
    userName?: string;
    fullName: string;
    connectCode?: string;
  }) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },
  me: async () => {
    const respones = await apiClient.get("/auth/me");
    return respones.data;
  },
  logout: async () => {
    await apiClient.get("/auth/logout");
  },
};
