import axiosInstance from "./main.service";

export const UserService = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/User");
    return response.data;
  },
};
