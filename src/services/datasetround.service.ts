import axiosInstance from "./main.service";

export const DatasetRoundService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/datasetrounds", payload);
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get("/api/datasetrounds");
    return response.data;
  },

  getById: async (roundId: number) => {
    const response = await axiosInstance.get(`/api/datasetrounds/${roundId}`);
    return response.data;
  },

  getByDataset: async (datasetId: number) => {
    const response = await axiosInstance.get(
      `/api/datasetrounds/dataset/${datasetId}`,
    );
    return response.data;
  },

  update: async (roundId: number, payload: any) => {
    const response = await axiosInstance.put(
      `/api/datasetrounds/${roundId}`,
      payload,
    );
    return response.data;
  },

  delete: async (roundId: number) => {
    const response = await axiosInstance.delete(
      `/api/datasetrounds/${roundId}`,
    );
    return response.data;
  },
};
