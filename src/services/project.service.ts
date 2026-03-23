import axiosInstance from "./main.service";

export const ProjectService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/projects", payload);
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get("/api/projects");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/projects/${id}`);
    return response.data;
  },

  getByManager: async () => {
    const response = await axiosInstance.get(`/api/projects/my-projects`);
    return response.data;
  },

  update: async (id: number, payload: any) => {
    const response = await axiosInstance.put(`/api/projects/${id}`, payload);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/projects/${id}`);
    return response.data;
  },
};
