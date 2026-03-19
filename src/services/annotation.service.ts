import axiosInstance from "./main.service";

export const AnnotationService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post(
      "/api/annotations/classification",
      payload,
    );
    return response.data;
  },

  annotation: async (payload: any) => {
    const response = await axiosInstance.post(
      "/api/annotations/shape",
      payload,
    );
    return response.data;
  },

  getByTaskId: async (taskId: number) => {
    const response = await axiosInstance.get(`/api/annotations/task/${taskId}`);
    return response.data;
  },
  update: async (annotationId: number, payload: any) => {
    const response = await axiosInstance.put(
      `/api/annotations/${annotationId}`,
      payload,
    );
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/api/annotations/${id}`);
    return response.data;
  },
};
