import axios from "axios"

interface ApiErrorBody { message?: string; errors?: Record<string, string | string[]> }

export function presentRequestError(error: unknown, fallback = "Não foi possível concluir a operação") {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback
  if (error.code === "ECONNABORTED") return "A operação demorou demais. Tente novamente."
  if (!error.response) return "Não foi possível conectar ao servidor. Verifique sua conexão."

  const validationMessage = Object.values(error.response.data?.errors ?? {}).flat()[0]
  if (validationMessage) return validationMessage
  if (error.response.data?.message) return error.response.data.message

  if (error.response.status === 401) return "Sua sessão expirou. Entre novamente."
  if (error.response.status === 403) return "Você não tem permissão para realizar esta ação."
  if (error.response.status === 404) return "O item solicitado não foi encontrado."
  if (error.response.status === 409) return "Há um conflito com outro cadastro ou agendamento."
  if (error.response.status >= 500) return "O servidor está indisponível no momento. Tente novamente."

  return fallback
}

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}
