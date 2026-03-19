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
    oldPassword: string;
    newPassword: string;
  }) => {
    const response = await axiosInstance.post(
      "/api/User/change-password",
      data,
    );
    return response.data;
  },
};
