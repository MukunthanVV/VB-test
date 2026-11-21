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

  const url = getImageUrl(src, targetDevice);
  if (!url) return null;

  return <img src={url} alt={alt} className={className} {...rest} />;
};

export default ResponsiveImage;
