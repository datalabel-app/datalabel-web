import axiosInstance from "./main.service";

export const TasksService = {
  create: async (payload: any) => {
    const response = await axiosInstance.post("/api/tasks", payload);
    return response.data;
  },
  getTaskByRound: async (roundId: number) => {
    const response = await axiosInstance.get(`/api/tasks/round/${roundId}`);
    return response.data;
  },
  getTasksByAnnotator: async (search?: string, status?: number) => {
    const params: any = {};
    if (search) params.search = search;
    if (status !== undefined) params.status = status;
    const response = await axiosInstance.get(`/api/tasks/annotator/me`, {
      params,
    });
    return response.data;
  },

  getTasksByReviewer: async (search?: string, status?: number) => {
    const params: any = {};
    if (search) params.search = search;
    if (status !== undefined) params.status = status;
    const response = await axiosInstance.get(`/api/tasks/reviewer/me`, {
      params,
    });
    return response.data;
  },
  getTaskById: async (taskId: number) => {
    const response = await axiosInstance.get(`/api/tasks/${taskId}`);
    return response.data;
  },
  getReviewTask: async (taskId: number) => {
    const response = await axiosInstance.get(`/api/tasks/${taskId}/review`);
    return response.data;
  },
  reviewBulk: async (payload: any) => {
    const response = await axiosInstance.post(
      `/api/tasks/review/bulk`,
      payload,
    );
    return response.data;
  },
  delete: async (taskId: number) => {
    const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
    return response.data;
  },
  update: async (taskId: number, payload: any) => {
    const response = await axiosInstance.put(`/api/tasks/${taskId}`, payload);
    return response.data;
  },
  updateDealine: async (taskId: number, payload: any) => {
    const response = await axiosInstance.put(`/api/tasks/${taskId}/deadline`, payload);
    return response.data;
  },
  getTaskManager: async () => {
    const response = await axiosInstance.get(`/api/tasks/manager/tasks`);
    return response.data;
  }
};
