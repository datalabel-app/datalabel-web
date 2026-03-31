import axiosInstance from "./main.service";

export const AnnotationService = {
  bulkCreateClassfication: async (payload: any) => {
    const response = await axiosInstance.post(
      "/api/annotations/classification/bulk",
      payload,
    );
    return response.data;
  },

  updateBulk: async (payload: any) => {
    const response = await axiosInstance.put(
      "/api/annotations/bulk-update",
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
  getAnnotationByTaskAndItem: async (taskId: number, itemId: number) => {
    const response = await axiosInstance.get(`/api/annotations`, {
      params: {
        itemId,
        taskId,
      },
    });
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
