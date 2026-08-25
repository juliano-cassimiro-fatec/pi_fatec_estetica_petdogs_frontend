import axios from "axios"
import type { AxiosRequestConfig } from "axios"
import { browserSessionStorage } from "../session/browserSession"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  timeout: 15_000,
})

export function authenticatedRequestConfig(config: AxiosRequestConfig = {}): AxiosRequestConfig {
  const token = browserSessionStorage.getToken()

  if (!token) return config

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  }
}

export default apiClient
