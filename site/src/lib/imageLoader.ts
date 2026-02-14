import type { ImageLoaderProps } from "next/image";

const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};

export default function cloudflareLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  const params = [`width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  if (process.env.NODE_ENV === "development") {
    if (src.startsWith("https://linkr.audio/images")) {
      return `${src}&${params.join("&")}`;
    }
    return `${src}?${params.join("&")}`;
  }
  if (src.startsWith("https://linkr.audio")) {
    return `${src.replace("https://linkr.audio", "")}&${params.join("&")}`;
  }

  return `/cdn-cgi/image/${params.join(",")}/${normalizeSrc(src)}`;
}
