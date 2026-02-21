import Image from "next/image";

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

export function cloudinaryUrl(raw: string, widthPx: number): string {
  if (!raw.includes("res.cloudinary.com")) return raw;
  const transforms = `f_auto,q_auto,w_${widthPx}`;
  return raw.replace("/image/upload/", `/image/upload/${transforms}/`);
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fill = false,
  sizes,
}: CloudinaryImageProps) {
  const isCloudinary = src.startsWith("http") && src.includes("res.cloudinary.com");

  const imageSrc = src.startsWith("http")
    ? src
    : `https://placehold.co/${width}x${height}/666/FFF?text=${encodeURIComponent(alt.slice(0, 20))}`;

  if (isCloudinary) {
    const optimizedSrc = cloudinaryUrl(src, width);

    if (fill) {
      return (
        <Image
          src={optimizedSrc}
          alt={alt}
          fill
          unoptimized
          className={`object-cover ${className}`}
          priority={priority}
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        />
      );
    }

    return (
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className={className}
        priority={priority}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        unoptimized
        className={`object-cover ${className}`}
        priority={priority}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={className}
      priority={priority}
    />
  );
}
