import axios from "axios";

interface ApiErrorBody {
  message?: string;
  code?: string;
  errors?: Record<string, string | string[]>;
}

const codeMessages: Record<string, string> = {
  CONFLICT: "Este registro não pode ser removido porque possui agendamentos ou dependências.",
  NOT_FOUND: "O registro não foi encontrado.",
  VALIDATION_ERROR: "Existem dados inválidos no formulário.",
  BAD_REQUEST: "Confira os dados informados.",
  FILE_REQUIRED: "Selecione um arquivo para continuar.",
  FILE_TYPE_REQUIRED: "Informe o tipo do arquivo enviado.",
  INVALID_IMAGE_PATH: "Faça o upload da imagem novamente.",
  UNSUPPORTED_MEDIA_TYPE: "Envie uma imagem JPG, PNG, WebP ou GIF.",
  EMPTY_FILE: "O arquivo selecionado está vazio.",
  IMAGE_TOO_LARGE: "A imagem deve ter no máximo 5 MB.",
  RATE_LIMITED: "Muitas tentativas. Aguarde antes de tentar novamente.",
  FORBIDDEN: "Você não tem permissão para realizar esta ação.",
  INTERNAL_ERROR: "Erro no servidor. Tente novamente mais tarde.",
};

const statusMessages: Record<number, string> = {
  400: "Confira os dados informados.",
  401: "Sua sessão expirou. Entre novamente.",
  403: "Você não tem permissão para realizar esta ação.",
  404: "Registro não encontrado.",
  409: "Não foi possível concluir porque existe um conflito.",
  413: "O arquivo excede o limite permitido.",
  415: "Formato de arquivo não suportado.",
  429: "Muitas tentativas. Aguarde e tente novamente.",
  500: "Ocorreu um erro interno. Tente novamente mais tarde.",
};

export interface ApiError {
  status: number;
  code: string;
  message: string;
  retryAfter: string | null;
}

export function getApiError(error: unknown): ApiError {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return {
      status: 0,
      code: "NETWORK_ERROR",
      message:
        error instanceof Error && error.message
          ? error.message
          : "Não foi possível concluir a solicitação.",
      retryAfter: null,
    };
  }

  if (error.code === "ECONNABORTED") {
    return {
      status: 0,
      code: "TIMEOUT",
      message: "A operação demorou demais. Tente novamente.",
      retryAfter: null,
    };
  }

  if (!error.response) {
    return {
      status: 0,
      code: "NETWORK_ERROR",
      message: "Não foi possível conectar ao servidor. Verifique sua internet.",
      retryAfter: null,
    };
  }

  const { status, headers, data } = error.response;
  const body = data && typeof data === "object" ? data : {};
  const responseData = body;
  const validationMessage = Object.values(responseData.errors ?? {}).flat()[0];
  const code = responseData.code ?? `HTTP_${status}`;
  const retryAfter = headers["retry-after"] ?? null;
  const genericMessage =
    responseData.message ??
    validationMessage ??
    codeMessages[code] ??
    statusMessages[status] ??
    "Não foi possível concluir a solicitação.";
  const message =
    status === 429 && retryAfter && !responseData.message
      ? `Muitas tentativas. Aguarde ${retryAfter} segundos e tente novamente.`
      : genericMessage;

  return {
    status,
    code,
    message,
    retryAfter,
  };
}

export function presentRequestError(error: unknown, fallback?: string) {
  return getApiError(error).message || fallback || "Não foi possível concluir a operação";
}

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
