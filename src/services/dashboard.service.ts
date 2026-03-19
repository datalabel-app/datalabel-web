import axiosInstance from "./main.service";

export const DashboardService = {
  getAdmin: async () => {
    const response = await axiosInstance.get("/api/dashboard/admin");
    return response.data;
  },

  getManager: async () => {
    const response = await axiosInstance.get(`/api/dashboard/manager`);
    return response.data;
  },
};
