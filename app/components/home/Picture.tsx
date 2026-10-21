type PictureProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  /** Pfad ohne Endung, z. B. /assets/img/variant-aurora – AVIF + WebP werden erwartet. */
  src: string;
};

/** AVIF mit WebP-Fallback für die lokalen Assets; externe URLs (Shopify CDN) direkt. */
export function Picture({src, alt = '', ...img}: PictureProps) {
  if (/^https?:|\.(jpe?g|png|webp|avif)$/.test(src)) {
    return <img src={src} alt={alt} {...img} />;
  }
  return (
    <picture>
      <source srcSet={`${src}.avif`} type="image/avif" />
      <img src={`${src}.webp`} alt={alt} {...img} />
    </picture>
  );
}
