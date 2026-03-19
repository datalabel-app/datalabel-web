import axiosInstance from "./main.service";

export const DataItemService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/dataitems", payload);
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get("/api/dataitems");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get(`/api/dataitems/${id}`);
    return response.data;
  },

  getByDataset: async (datasetId: number) => {
    const response = await axiosInstance.get(
      `/api/dataitems/dataset/${datasetId}`,
    );
    return response.data;
  },

  assignAnnotator: async (itemId: number, annotatorId: number) => {
    const response = await axiosInstance.put(
      `/api/dataitems/${itemId}/assign-annotator/${annotatorId}`,
    );
    return response.data;
  },

  assignReviewer: async (itemId: number, reviewerId: number) => {
    const response = await axiosInstance.put(
      `/api/dataitems/${itemId}/assign-reviewer`,
      {
        reviewerId,
      },
    );
    return response.data;
  },

  getByAnnotator: async () => {
    const response = await axiosInstance.get(`/api/dataitems/annotator`);
    return response.data;
  },

  getByReviewer: async () => {
    const response = await axiosInstance.get(`/api/dataitems/reviewer`);
    return response.data;
  },

  update: async (id: number, payload: any) => {
    const response = await axiosInstance.put(`/api/dataitems/${id}`, payload);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/dataitems/${id}`);
    return response.data;
  },
};
