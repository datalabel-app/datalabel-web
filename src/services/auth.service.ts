import axiosInstance from "./main.service";

export const AuthService = {
  register: async (payload: any) => {
    const response = await axiosInstance.post("/api/Auth/register", payload);
    return response.data;
  },
  login: async (payload: any) => {
    const response = await axiosInstance.post("/api/Auth/login", payload);
    return response.data;
  },
  forgotPassword: async (payload: { email: string }) => {
    const response = await axiosInstance.post(
      "/api/Auth/forgot-password",
      payload,
    );
    return response.data;
  },

  verifyOtp: async (payload: { email: string; otp: string }) => {
    const response = await axiosInstance.post("/api/Auth/verify-otp", payload);
    return response.data;
  },

  resetPassword: async (payload: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    const response = await axiosInstance.post(
      "/api/Auth/reset-password",
      payload,
    );
    return response.data;
  },
  exportTemplate: async () => {
    const response = await axiosInstance.get("/api/Auth/export-template", {
      responseType: "blob",
    });
    return response.data;
  },

  importUsers: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/api/Auth/import-users",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
};
