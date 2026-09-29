export function resolveImageUrl(src: string) {
  if (src.startsWith("http") || src.startsWith("data:")) return src;

  const configuredApiUrl: unknown = import.meta.env.VITE_API_URL;
  const apiUrl = typeof configuredApiUrl === "string" ? configuredApiUrl : "/api/v1";
  return `${apiUrl.replace(/\/api\/v1\/?$/, "")}${src}`;
}
