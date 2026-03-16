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
};
