import axios from "axios";
import { browserSessionStorage } from "../session/browserSession";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = browserSessionStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      browserSessionStorage.clearSession();
      window.dispatchEvent(new Event("petdogs:session-expired"));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
