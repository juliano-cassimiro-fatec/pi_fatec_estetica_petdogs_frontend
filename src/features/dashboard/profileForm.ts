import type { Customer, Professional } from "../../features/shared/types";

export interface ProfileFormState {
  name: string;
  email: string;
  telefone: string;
  foto: string;
  especialidade: string;
  dias_trabalho: number[];
  horario_inicio: string;
  horario_fim: string;
  almoco_inicio: string;
  almoco_fim: string;
}

export function emptyProfileForm(): ProfileFormState {
  return {
    name: "",
    email: "",
    telefone: "",
    foto: "",
    especialidade: "",
    dias_trabalho: [1, 2, 3, 4, 5],
    horario_inicio: "08:00",
    horario_fim: "18:00",
    almoco_inicio: "12:00",
    almoco_fim: "13:00",
  };
}

export function presentProfileForm(profile?: Customer | Professional): ProfileFormState {
  if (!profile) {
    return emptyProfileForm();
  }

  return {
    name: profile.name,
    email: profile.email,
    telefone: profile.telefone ?? "",
    foto: profile.foto ?? "",
    especialidade: "especialidade" in profile ? profile.especialidade : "",
    dias_trabalho: "dias_trabalho" in profile ? profile.dias_trabalho : [1, 2, 3, 4, 5],
    horario_inicio: "horario_inicio" in profile ? profile.horario_inicio : "08:00",
    horario_fim: "horario_fim" in profile ? profile.horario_fim : "18:00",
    almoco_inicio: "almoco_inicio" in profile ? (profile.almoco_inicio ?? "12:00") : "12:00",
    almoco_fim: "almoco_fim" in profile ? (profile.almoco_fim ?? "13:00") : "13:00",
  };
}
