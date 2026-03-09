import axiosInstance from "./main.service";

export const DatasetService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/Dataset", payload);
    return response.data;
  },
  getDatasetByProject: async (projectId: any) => {
    const response = await axiosInstance.get(
      `/api/Dataset/project/${projectId}`,
    );
    return response.data;
  },
};
