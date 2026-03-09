import axiosInstance from "./main.service";

export const DataitemService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/DataItem", payload);
    return response.data;
  },
  getDataitemByDataset: async (datasetId: any) => {
    const response = await axiosInstance.get(
      `/api/DataItem/dataset/${datasetId}`,
    );
    return response.data;
  },
};
