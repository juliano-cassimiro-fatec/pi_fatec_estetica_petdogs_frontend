import apiClient from "../api/client";

const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageSize = 5 * 1024 * 1024;

export interface UploadResponse {
  caminho: string;
  nome: string;
  tipo: string;
  url: string;
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  if (!acceptedImageTypes.has(file.type)) {
    throw new Error("Selecione uma imagem JPEG, PNG, WebP ou GIF");
  }
  if (file.size > maxImageSize) {
    throw new Error("A imagem deve ter no máximo 5 MB");
  }

  const response = await apiClient.post<UploadResponse>("/uploads", file, {
    headers: { "Content-Type": file.type },
  });
  return response.data;
}