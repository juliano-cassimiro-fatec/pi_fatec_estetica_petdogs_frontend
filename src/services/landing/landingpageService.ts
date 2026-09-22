import apiClient from "../api/client";
import type { Service } from "../../features/shared/types";
import type {
  LandingPageData,
  LandingPageRepository,
  LandingService,
} from "./types";

const defaultServices: LandingService[] = [
  {
    id: "default-banho",
    name: "Banho",
    description:
      "Banho completo com produtos adequados para deixar seu pet limpo, cheiroso e confortável.",
  },
  {
    id: "default-tosa",
    name: "Tosa",
    description:
      "Tosa realizada com cuidado e atenção, respeitando o estilo e o bem-estar do seu pet.",
  },
  {
    id: "default-banho-tosa",
    name: "Banho + Tosa",
    description:
      "Cuidado completo para deixar seu pet limpo, confortável e com o visual renovado.",
  },
];

function getStringValue(
  object: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = object[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
}

function formatPrice(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(",", ".");
  const number = Number(normalized);

  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

function formatDuration(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return `${number} min`;
}

function mapServiceToLanding(
  service: Service,
  index: number,
): LandingService {
  const raw = service as unknown as Record<string, unknown>;

  const id =
    getStringValue(raw, ["_id", "id"]) ??
    `service-${index}`;

  const name =
    getStringValue(raw, ["name", "nome", "title", "titulo"]) ??
    "Serviço";

  const description =
    getStringValue(raw, [
      "description",
      "descricao",
      "details",
      "detalhes",
    ]) ??
    "Cuidado profissional para o seu pet.";

  const rawPrice = getStringValue(raw, [
    "price",
    "preco",
    "valor",
  ]);

  const rawDuration = getStringValue(raw, [
    "duration",
    "duracao",
    "durationMinutes",
    "tempo",
  ]);

  return {
    id,
    name,
    description,
    price: formatPrice(rawPrice),
    duration: formatDuration(rawDuration),
  };
}

export const axiosLandingPageRepository: LandingPageRepository = {
  async listServices() {
    const response = await apiClient.get<Service[]>("/servicos");
    return response.data;
  },
};

export function createLandingPageService(
  repository: LandingPageRepository,
) {
  return {
    async loadLandingPage(): Promise<LandingPageData> {
      try {
        const services = await repository.listServices();

        if (!services || services.length === 0) {
          return {
            services: defaultServices,
            source: "fallback",
          };
        }

        return {
          services: services.map(mapServiceToLanding),
          source: "api",
        };
      } catch (error) {
        console.warn(
          "Não foi possível carregar os serviços da Landing Page. Usando dados padrão.",
          error,
        );

        return {
          services: defaultServices,
          source: "fallback",
        };
      }
    },
  };
}

export const landingPageService = createLandingPageService(
  axiosLandingPageRepository,
);