import axiosInstance from "./main.service";

export const ProjectService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/Project", payload);
    return response.data;
  },
  update: async (id: number, payload: any) => {
    const response = await axiosInstance.put(`/api/Project/${id}`, payload);
    return response.data;
  },
  getAll: async (payload: any) => {
    const response = await axiosInstance.get("/api/Project", payload);
    return response.data;
  },
  getById: async (projectId: any) => {
    const response = await axiosInstance.get(`/api/Project/${projectId}`);
    return response.data;
  },
};