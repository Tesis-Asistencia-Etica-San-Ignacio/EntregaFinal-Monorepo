import axios from "axios";
import { authApi } from "./authApi";

export const userApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export const noCredsInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: false,
});

userApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean });

    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await authApi.post("/auth/refresh");
        return userApi(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (error.response && error.response.status !== 401) {
      console.error("API Error:", error);
    }

    return Promise.reject(error);
  }
);
