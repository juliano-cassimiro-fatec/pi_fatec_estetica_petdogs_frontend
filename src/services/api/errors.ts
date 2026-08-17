export function presentRequestError(error: unknown, fallback = "Não foi possível concluir a operação") {
  if (typeof error === "object" && error && "response" in error) {
    const response = error.response as { data?: { message?: string } }
    return response.data?.message ?? fallback
  }

  return fallback
}

export function isUnauthorizedError(error: unknown) {
  if (typeof error !== "object" || !error || !("response" in error)) {
    return false
  }

  const response = error.response as { status?: number }
  return response.status === 401
}
