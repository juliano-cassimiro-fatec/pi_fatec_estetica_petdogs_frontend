import axios from "axios";
import { browserSessionStorage } from "../session/browserSession";
import { ApiRequestError, getApiError } from "./errors";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    showGlobalError?: boolean;
  }
}

const apiClient = axios.create({
  baseURL:
    typeof import.meta.env.VITE_API_URL === "string" ? import.meta.env.VITE_API_URL : "/api/v1",
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  if (config.skipAuth) return config;

  const token = browserSessionStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const axiosError = axios.isAxiosError(error) ? error : null;
    const apiError = getApiError(error);
    const passwordChangeRequired = apiError.code === "PASSWORD_CHANGE_REQUIRED";

    if (passwordChangeRequired) {
      window.dispatchEvent(new Event("petdogs:password-change-required"));
    } else if (
      apiError.code !== "EMAIL_VERIFICATION_REQUIRED" &&
      axiosError?.config?.showGlobalError !== false
    ) {
      window.dispatchEvent(
        new CustomEvent("petdogs:toast", {
          detail: { message: apiError.message, code: apiError.code },
        }),
      );
    }
    if (axiosError?.response?.status === 401 && !axiosError.config?.skipAuth) {
      browserSessionStorage.clearSession();
      window.dispatchEvent(new Event("petdogs:session-expired"));
    }

    return Promise.reject(new ApiRequestError(apiError));
  },
);

export default apiClient;
