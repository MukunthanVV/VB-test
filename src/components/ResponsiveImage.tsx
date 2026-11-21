import React from 'react';

export type ResponsiveImageSource = 
  | string 
  | { desktop?: string; foldable?: string; mobile?: string } 
  | undefined 
  | null;

export const getObjectPosition = (focus?: string): string => {
  switch (focus) {
    case 'top': return 'center top';
    case 'upper': return 'center 35%';
    case 'lower': return 'center 65%';
    case 'bottom': return 'center bottom';
    case 'center':
    default: return 'center 50%';
  }
};

interface ResponsiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: ResponsiveImageSource;
  targetDevice?: 'desktop' | 'foldable' | 'mobile';
  focus?: string;
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
  focus,
  alt = '',
  className = '',
  style,
  ...rest
}) => {
  if (!src) return null;

  const url = getImageUrl(src, targetDevice);
  if (!url) return null;

  const combinedStyle: React.CSSProperties = {
    objectPosition: getObjectPosition(focus),
    ...style,
  };

  return <img src={url} alt={alt} className={className} style={combinedStyle} {...rest} />;
};

export default ResponsiveImage;
