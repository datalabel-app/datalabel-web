import axiosInstance from "./main.service";

export const ErrorHistoryService = {
  getByDataset: async (datasetId: number) => {
    try {
      const response = await axiosInstance.get(
        `/api/error-history/dataset/${datasetId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Get error history by dataset error:", error);
      throw error;
    }
  },

  getGroupedByItem: async (datasetId: number) => {
    try {
      const response = await axiosInstance.get(
        `/api/error-history/dataset/${datasetId}/group`,
      );
      return response.data;
    } catch (error) {
      console.error("Get grouped error history error:", error);
      throw error;
    }
  },

  getErrorsGroupByItem: async (datasetId: number) => {
    const response = await axiosInstance.get(
      `/api/error-history/dataset/${datasetId}/group-by-item`,
    );
    return response.data;

  },

  getSummary: async (datasetId: number) => {
    try {
      const response = await axiosInstance.get(
        `/api/error-history/dataset/${datasetId}/summary`,
      );
      return response.data;
    } catch (error) {
      console.error("Get error summary error:", error);
      throw error;
    }
  },
};
