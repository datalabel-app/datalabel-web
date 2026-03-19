import axiosInstance from "./main.service";

export const LabelService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/labels", payload);
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get("/api/labels");
    return response.data;
  },

  getById: async (labelId: number) => {
    const response = await axiosInstance.get(`/api/labels/${labelId}`);
    return response.data;
  },

  getByRound: async (roundId: number) => {
    const response = await axiosInstance.get(`/api/labels/round/${roundId}`);
    return response.data;
  },

  update: async (labelId: number, payload: any) => {
    const response = await axiosInstance.put(`/api/labels/${labelId}`, payload);
    return response.data;
  },

  delete: async (labelId: number) => {
    const response = await axiosInstance.delete(`/api/labels/${labelId}`);
    return response.data;
  },
  requestLabel: async (payload: {
    roundId: number;
    labelName: string;
    description?: string;
  }) => {
    const response = await axiosInstance.post("/api/labels/request", payload);
    return response.data;
  },
  getPendingByProject: async (projectId: number) => {
    const response = await axiosInstance.get(
      `/api/labels/pending/project/${projectId}`,
    );
    return response.data;
  },

  approve: async (labelId: number) => {
    const response = await axiosInstance.put(`/api/labels/${labelId}/approve`);
    return response.data;
  },

  reject: async (labelId: number) => {
    const response = await axiosInstance.put(`/api/labels/${labelId}/reject`);
    return response.data;
  },
  getMyLabelRequest: async () => {
    const response = await axiosInstance.get(`/api/labels/my-labels`);
    return response.data;
  },
};
