import axiosInstance from "./main.service";

export const AnnotationService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/annotations", payload);
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get("/api/annotations");
    return response.data;
  },

  getById: async (annotationId: number) => {
    const response = await axiosInstance.get(
      `/api/annotations/${annotationId}`,
    );
    return response.data;
  },

  getByItem: async (itemId: number) => {
    const response = await axiosInstance.get(`/api/annotations/item/${itemId}`);
    return response.data;
  },

  getByRound: async (roundId: number) => {
    const response = await axiosInstance.get(
      `/api/annotations/round/${roundId}`,
    );
    return response.data;
  },

  update: async (annotationId: number, payload: any) => {
    const response = await axiosInstance.put(
      `/api/annotations/${annotationId}`,
      payload,
    );
    return response.data;
  },

  delete: async (annotationId: number) => {
    const response = await axiosInstance.delete(
      `/api/annotations/${annotationId}`,
    );
    return response.data;
  },
};
