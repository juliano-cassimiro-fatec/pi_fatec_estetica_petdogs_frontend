function PhotoPreview({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null

  return <img className="h-20 w-20 rounded-2xl border border-slate-200 object-cover shadow-sm" src={src} alt={alt} />
}
export default PhotoPreview