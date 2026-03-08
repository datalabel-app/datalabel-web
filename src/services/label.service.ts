import axiosInstance from "./main.service";

export const LabelService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/Label", payload);
    return response.data;
  },
  update: async (id: number, payload: any) => {
    const response = await axiosInstance.put(`/api/Label/${id}`, payload);
    return response.data;
  },
  getByProjectId: async (projectId: any) => {
    const response = await axiosInstance.get(`/api/Label/project/${projectId}`);
    return response.data;
  },
};
