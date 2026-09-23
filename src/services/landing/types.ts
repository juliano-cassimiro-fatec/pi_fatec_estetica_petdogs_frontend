import type { Service } from "../../features/shared/types";

export type LandingService = {
  id: string;
  name: string;
  description: string;
  price?: string;
  duration?: string;
};

export type LandingPageData = {
  services: LandingService[];
  source: "api" | "fallback";
};

export interface LandingPageRepository {
  listServices(): Promise<Service[]>;
}
