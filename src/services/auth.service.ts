import axiosInstance from "./main.service";

export const AuthService = {
  register: async (payload: any) => {
    const response = await axiosInstance.post("/api/Auth/register", payload);
    return response.data;
  },
  login: async (payload: any) => {
    const response = await axiosInstance.post("/api/Auth/login", payload);
    return response.data;
  },
};
