import Icon from "./Icon";

export function resolveImageUrl(src: string) {
  if (src.startsWith("http") || src.startsWith("data:")) return src;

  const apiUrl = import.meta.env.VITE_API_URL ?? "/api/v1";
  return `${apiUrl.replace(/\/api\/v1\/?$/, "")}${src}`;
}

function PhotoPreview({
  src,
  alt,
  className = "h-20 w-20 rounded-2xl",
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`${className} grid place-items-center border border-dashed border-slate-300 bg-slate-50 text-slate-400`}
        aria-label={alt}
      >
        <Icon name="user" />
      </div>
    );
  }

  return (
    <img
      className={`${className} border border-slate-200 object-cover shadow-sm`}
      src={resolveImageUrl(src)}
      alt={alt}
    />
  );
}

export default PhotoPreview;
