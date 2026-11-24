import axios from "axios";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}


const TECHNICAL_MESSAGE_PATTERN =
  /\b(token|jwt|bearer|csrf|xsrf|oauth|unauthorized|forbidden|internal server|bad gateway|service unavailable|gateway timeout|prisma|sequelize|typeorm|mongoose|sql|database|exception|stack|trace|syntaxerror|typeerror|referenceerror|cannot read|is not defined|is not a function|request failed with status|econnrefused|etimedout|enotfound)\b/i;

function sanitizeUserMessage(message: unknown): string | undefined {
  if (typeof message !== "string") return undefined;

  const trimmed = message.trim();
  if (!trimmed) return undefined;
  if (TECHNICAL_MESSAGE_PATTERN.test(trimmed)) return undefined;

  return trimmed;
}

function getValidationMessage(errors: unknown): string | undefined {
  if (!isRecord(errors)) return undefined;

  for (const fieldErrors of Object.values(errors)) {
    const messages = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
    for (const value of messages) {
      const safeMessage = sanitizeUserMessage(value);
      if (safeMessage) return safeMessage;
    }
  }

  return undefined;
}

const codeMessages: Partial<Record<string, string>> = {
  INVALID_CREDENTIALS: "E-mail ou senha inválidos.",
  UNAUTHORIZED: "Sua sessão expirou. Entre novamente.",
  TOKEN_EXPIRED: "Sua sessão expirou. Entre novamente.",
  INVALID_TOKEN: "Sua sessão expirou. Entre novamente.",
  SESSION_EXPIRED: "Sua sessão expirou. Entre novamente.",
  EMAIL_VERIFICATION_REQUIRED: "Confirme seu e-mail antes de entrar.",
  EMAIL_ALREADY_EXISTS: "Este e-mail já está cadastrado.",
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

const statusMessages: Partial<Record<number, string>> = {
  400: "Confira os dados informados.",
  401: "Sua sessão expirou. Entre novamente.",
  403: "Você não tem permissão para realizar esta ação.",
  404: "Registro não encontrado.",
  409: "Não foi possível concluir porque existe um conflito.",
  413: "O arquivo excede o limite permitido.",
  415: "Formato de arquivo não suportado.",
  429: "Muitas tentativas. Aguarde e tente novamente.",
  500: "Ocorreu um erro interno. Tente novamente mais tarde.",
  502: "O servidor está temporariamente indisponível. Tente novamente em instantes.",
  503: "O serviço está temporariamente indisponível. Tente novamente em instantes.",
  504: "O servidor demorou para responder. Tente novamente.",
};

const DEFAULT_ERROR_MESSAGE = "Não foi possível concluir a solicitação. Tente novamente.";

export interface ApiError {
  status: number;
  code: string;
  message: string;
  retryAfter: string | null;
}

export class ApiRequestError extends Error {
  readonly details: ApiError;

  constructor(details: ApiError) {
    super(details.message);
    this.details = details;
    this.name = "ApiRequestError";
  }
}

export function getApiError(error: unknown): ApiError {
  if (error instanceof ApiRequestError) return error.details;

  // Nunca expõe error.message de exceções internas do JavaScript (ex.: TypeError, falhas de parse/token)
  if (!axios.isAxiosError<unknown>(error)) {
    return {
      status: 0,
      code: "UNEXPECTED_ERROR",
      message: DEFAULT_ERROR_MESSAGE,
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
  const responseData = isRecord(data) ? data : {};
  const code = typeof responseData.code === "string" ? responseData.code : `HTTP_${status}`;

  // Ignora qualquer mensagem vinda do backend em erros 5xx ou quando contiver termos técnicos/de token
  const safeResponseMessage =
    status < 500 ? sanitizeUserMessage(responseData.message) : undefined;
  const validationMessage =
    status < 500 ? getValidationMessage(responseData.errors) : undefined;

  const retryAfterHeader: unknown = headers["retry-after"];
  const retryAfter = typeof retryAfterHeader === "string" ? retryAfterHeader : null;

  const genericMessage =
    codeMessages[code] ??
    safeResponseMessage ??
    validationMessage ??
    statusMessages[status] ??
    DEFAULT_ERROR_MESSAGE;

  const message =
    status === 429 && retryAfter && !safeResponseMessage
      ? `Muitas tentativas. Aguarde ${retryAfter} segundos e tente novamente.`
      : genericMessage;

  return {
    status,
    code,
    message,
    retryAfter,
  };
}

export function presentRequestError(error: unknown, fallbackMessage?: string): string {
  const apiError = getApiError(error);
  if (fallbackMessage && apiError.message === DEFAULT_ERROR_MESSAGE) {
    return fallbackMessage;
  }
  return apiError.message;
}

export function isUnauthorizedError(error: unknown): boolean {
  return getApiError(error).status === 401;
}
