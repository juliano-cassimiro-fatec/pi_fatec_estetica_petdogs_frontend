import type { Service } from "../../features/shared/types";

export interface LandingService {
  id: string;
  name: string;
  description: string;
  price?: string;
  duration?: string;
}

export interface LandingPageData {
  services: LandingService[];
  source: "api" | "fallback";
}

export interface LandingPageRepository {
  listServices(): Promise<Service[]>;
}
