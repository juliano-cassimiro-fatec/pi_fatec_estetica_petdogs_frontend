import axios from "axios"
import { browserSessionStorage } from "../session/browserSession"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
})

apiClient.interceptors.request.use((config) => {
  const token = browserSessionStorage.getToken()

  if (token && token.length < 1000) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (token) {
    browserSessionStorage.clearSession()
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 431 || error?.response?.status === 401) {
      browserSessionStorage.clearSession()
    }

    return Promise.reject(error)
  },
)

export default apiClient
