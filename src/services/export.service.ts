import axiosInstance from "./main.service";

export const ExportService = {
  exportAll: async (datasetId: number) => {
    try {
      const response = await axiosInstance.get(
        `/api/export?datasetId=${datasetId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Export dataset error:", error);
      throw error;
    }
  },

  exportByRound: async (roundId: number) => {
    try {
      const response = await axiosInstance.get(
        `/api/export?roundId=${roundId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Export round error:", error);
      throw error;
    }
  },
};
