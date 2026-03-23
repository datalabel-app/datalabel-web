import axiosInstance from "./main.service";

export const DatasetService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/datasets", payload);
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get("/api/datasets");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/datasets/${id}`);
    return response.data;
  },

  getByProject: async (projectId: number) => {
    const response = await axiosInstance.get(
      `/api/datasets/project/${projectId}`,
    );
    return response.data;
  },

  getTreeDatasetByProject: async (projectId: number) => {
    const response = await axiosInstance.get(`/api/datasets/tree/${projectId}`);
    return response.data;
  },

  update: async (id: number, payload: any) => {
    const response = await axiosInstance.put(`/api/datasets/${id}`, payload);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/datasets/${id}`);
    return response.data;
  },
};
