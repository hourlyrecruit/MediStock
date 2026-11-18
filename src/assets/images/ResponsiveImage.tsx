import { useCallback, useState, type CSSProperties } from 'react';
import { cn } from '@/shared/cn';
import type { ImageEntry } from './manifest';

export interface ResponsiveImageProps {
  image: ImageEntry;
  sizes?: string;
  alt?: string;
  priority?: boolean;
  grade?: boolean;
  fill?: boolean;
  className?: string;
  imgClassName?: string;
}

const GRADE: CSSProperties = {
  backgroundImage:
    'linear-gradient(180deg, color-mix(in oklab, var(--primary-tint) 70%, transparent) 0%, color-mix(in oklab, var(--primary-tint) 25%, transparent) 100%)',
  mixBlendMode: 'multiply',
};

export function ResponsiveImage({
  image,
  sizes = '100vw',
  alt,
  priority = false,
  grade = false,
  fill = false,
  className,
  imgClassName,
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const markLoaded = useCallback(() => setLoaded(true), []);
  const imgRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete && node.naturalWidth > 0) markLoaded();
    },
    [markLoaded],
  );

  return (
    <div
      className={cn('relative overflow-hidden bg-surface-muted', fill && 'absolute inset-0', className)}
      style={fill ? undefined : { aspectRatio: `${image.width} / ${image.height}` }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-cover bg-center blur-xl transition-opacity duration-500 ease-out"
        style={{ backgroundImage: `url("${image.src.placeholder}")`, opacity: loaded ? 0 : 1 }}
      />
      <picture>
        <source type="image/avif" srcSet={image.src.avif} sizes={sizes} />
        <source type="image/webp" srcSet={image.src.webp} sizes={sizes} />
        <img
          ref={imgRef}
          src={image.src.jpg}
          srcSet={image.src.jpgSrcset}
          sizes={sizes}
          width={image.width}
          height={image.height}
          alt={alt ?? image.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={markLoaded}
          className={cn(
            'relative h-full w-full object-cover transition-opacity duration-500 ease-out',
            grade && 'saturate-[.85]',
            imgClassName,
          )}
          style={{ opacity: loaded ? 1 : 0 }}
        />
      </picture>
      {grade ? <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={GRADE} /> : null}
    </div>
  );
}
