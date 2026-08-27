interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  fallbackLabel?: string;
}

const sizeClassMap = {
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({ src, alt, size = "md", fallbackLabel = "U" }: AvatarProps) {
  if (src) {
    return (
      <img
        className={`${sizeClassMap[size]} rounded-2xl object-cover ring-2 ring-white shadow-sm`}
        src={src}
        alt={alt}
      />
    );
  }

  return (
    <div
      className={`${sizeClassMap[size]} grid place-items-center rounded-2xl bg-blue-100 font-black text-blue-700 ring-2 ring-white shadow-sm`}
      aria-hidden="true"
    >
      {fallbackLabel.slice(0, 1).toUpperCase()}
    </div>
  );
}
