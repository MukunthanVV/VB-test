import React from 'react';

export type ResponsiveImageSource = 
  | string 
  | { desktop?: string; foldable?: string; mobile?: string } 
  | undefined 
  | null;

interface ResponsiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: ResponsiveImageSource;
  targetDevice?: 'desktop' | 'foldable' | 'mobile';
}

export const getImageUrl = (
  source: ResponsiveImageSource, 
  target?: 'desktop' | 'foldable' | 'mobile'
): string => {
  if (!source) return '';
  if (typeof source === 'string') return source;
  if (typeof source === 'object') {
    if (target && source[target]) return source[target]!;
    return source.desktop || source.foldable || source.mobile || '';
  }
  return '';
};

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  targetDevice,
  alt = '',
  className = '',
  ...rest
}) => {
  if (!src) return null;

  // If specific target device is requested or it's a simple string URL
  if (typeof src === 'string' || targetDevice) {
    const url = getImageUrl(src, targetDevice);
    return <img src={url} alt={alt} className={className} {...rest} />;
  }

  // Multi-device responsive picture element
  const hasResponsiveVariants = src.mobile || src.foldable || src.desktop;
  if (!hasResponsiveVariants) {
    return null;
  }

  const defaultUrl = src.desktop || src.foldable || src.mobile || '';

  return (
    <picture className="contents">
      {/* Mobile: Phones (up to 640px) */}
      {src.mobile && (
        <source media="(max-width: 640px)" srcSet={src.mobile} />
      )}
      {/* Foldables & iPads: Tablets & Foldables (641px to 1024px) */}
      {src.foldable && (
        <source media="(max-width: 1024px)" srcSet={src.foldable} />
      )}
      {/* Desktop: Default fallback for 1025px+ */}
      <img src={defaultUrl} alt={alt} className={className} {...rest} />
    </picture>
  );
};

export default ResponsiveImage;
