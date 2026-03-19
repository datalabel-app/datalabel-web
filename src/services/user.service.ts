import axiosInstance from "./main.service";

export const UserService = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/User");
    return response.data;
  },
  getAnnotator: async () => {
    const response = await axiosInstance.get("/api/User/annotators");
    return response.data;
  },
  getReviewer: async () => {
    const response = await axiosInstance.get("/api/User/reviewers");
    return response.data;
  },
    changePassword: async (data: {

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const response = await axiosInstance.post(
      "/api/User/change-password",
      data,
    );
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get("/api/User/me");
    return response.data;
  },

  updateProfile: async (data: { fullName?: string }) => {
    const response = await axiosInstance.put("/api/User/me", data);
    return response.data;
  },
  changePasswordByEmail: async (payload: any) => {
    const response = await axiosInstance.post(
      "/api/User/change-password-by-email",
      payload,
    );
    return response.data;
  },

  banUser: async (userId: number) => {
    const res = await axiosInstance.post(`/api/User/ban/${userId}`);
    return res.data;
  },

  unbanUser: async (userId: number) => {
    const res = await axiosInstance.post(`/api/User/unban/${userId}`);
    return res.data;
  },
};
