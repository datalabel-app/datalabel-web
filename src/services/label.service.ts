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
};
