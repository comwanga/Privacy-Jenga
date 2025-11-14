/**
 * Image Optimization Utilities
 * Handles responsive images, lazy loading, and format optimization
 */

export interface ImageOptimizationOptions {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
  loading?: 'lazy' | 'eager';
  formats?: ('webp' | 'jpeg' | 'png')[];
  sizes?: string;
  className?: string;
}

interface ResponsiveImageSizes {
  mobile: number;
  tablet: number;
  desktop: number;
}

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (
  basePath: string,
  sizes: ResponsiveImageSizes,
  format: 'webp' | 'jpeg' | 'png' = 'webp'
): string => {
  const extension = format === 'webp' ? '.webp' : format === 'jpeg' ? '.jpg' : '.png';
  
  return `
    ${basePath}-${sizes.mobile}w${extension} ${sizes.mobile}w,
    ${basePath}-${sizes.tablet}w${extension} ${sizes.tablet}w,
    ${basePath}-${sizes.desktop}w${extension} ${sizes.desktop}w
  `.trim();
};

/**
 * Check WebP support
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get optimal image format based on browser support and network
 */
export const getOptimalImageFormat = async (): Promise<'webp' | 'jpeg'> => {
  const webpSupported = await supportsWebP();
  return webpSupported ? 'webp' : 'jpeg';
};

/**
 * Convert image URL to WebP if supported
 */
export const toWebPIfSupported = async (url: string): Promise<string> => {
  if (!url.match(/\.(jpg|jpeg|png)$/i)) return url;
  
  const format = await getOptimalImageFormat();
  if (format === 'webp') {
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  
  return url;
};

/**
 * Lazy load image with IntersectionObserver
 */
export const lazyLoadImage = (
  imgElement: HTMLImageElement,
  options: IntersectionObserverInit = {}
): void => {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (src) img.src = src;
        if (srcset) img.srcset = srcset;
        
        img.classList.remove('lazy');
        obs.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px', // Load 50px before entering viewport
    threshold: 0.01,
    ...options,
  });

  observer.observe(imgElement);
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = async (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.map(url => preloadImage(url)));
};

/**
 * Get image dimensions without loading full image
 */
export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Compress image quality based on network speed
 */
export const getQualityParameter = (quality: 'low' | 'medium' | 'high'): number => {
  const qualities = {
    low: 60,
    medium: 80,
    high: 95,
  };
  
  return qualities[quality];
};

/**
 * Build optimized image URL with query parameters
 */
export const buildOptimizedImageUrl = (
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'low' | 'medium' | 'high';
    format?: 'webp' | 'jpeg' | 'png';
  }
): string => {
  const params = new URLSearchParams();
  
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', getQualityParameter(options.quality).toString());
  if (options.format) params.append('fm', options.format);
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Create blur placeholder for images
 */
export const createBlurPlaceholder = (src: string, width: number = 10): string => {
  // Return a tiny blurred version (would typically be generated server-side)
  return buildOptimizedImageUrl(src, {
    width,
    quality: 'low',
    format: 'jpeg',
  });
};

/**
 * Progressive image loading component helper
 */
export class ProgressiveImageLoader {
  private img: HTMLImageElement | null = null;
  private placeholder: string;
  private fullSrc: string;
  private onLoad?: () => void;

  constructor(placeholder: string, fullSrc: string, onLoad?: () => void) {
    this.placeholder = placeholder;
    this.fullSrc = fullSrc;
    this.onLoad = onLoad;
  }

  load(targetElement: HTMLImageElement) {
    this.img = targetElement;
    
    // First load placeholder
    this.img.src = this.placeholder;
    this.img.classList.add('blur');
    
    // Then load full image
    const fullImg = new Image();
    fullImg.onload = () => {
      if (this.img) {
        this.img.src = this.fullSrc;
        this.img.classList.remove('blur');
        this.img.classList.add('loaded');
        
        if (this.onLoad) {
          this.onLoad();
        }
      }
    };
    fullImg.src = this.fullSrc;
  }

  cancel() {
    this.img = null;
  }
}

/**
 * Check if image is in cache
 */
export const isImageCached = (src: string): boolean => {
  const img = new Image();
  img.src = src;
  return img.complete;
};

/**
 * Estimate image file size
 */
export const estimateImageSize = (
  width: number,
  height: number,
  format: 'webp' | 'jpeg' | 'png',
  quality: 'low' | 'medium' | 'high'
): number => {
  const pixels = width * height;
  
  // Rough estimates in bytes per pixel
  const bytesPerPixel = {
    webp: { low: 0.1, medium: 0.2, high: 0.4 },
    jpeg: { low: 0.15, medium: 0.3, high: 0.6 },
    png: { low: 0.5, medium: 1.0, high: 2.0 },
  };
  
  return Math.ceil(pixels * bytesPerPixel[format][quality]);
};

/**
 * Create picture element with multiple sources
 */
export const createPictureElement = (options: {
  webpSrc: string;
  jpegSrc: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}): string => {
  return `
    <picture>
      <source srcset="${options.webpSrc}" type="image/webp">
      <source srcset="${options.jpegSrc}" type="image/jpeg">
      <img 
        src="${options.jpegSrc}" 
        alt="${options.alt}"
        ${options.className ? `class="${options.className}"` : ''}
        ${options.loading ? `loading="${options.loading}"` : ''}
        ${options.sizes ? `sizes="${options.sizes}"` : ''}
      >
    </picture>
  `.trim();
};

/**
 * Batch preload images with priority
 */
export const batchPreloadImages = async (
  images: Array<{ src: string; priority: number }>,
  maxConcurrent: number = 3
): Promise<void> => {
  // Sort by priority (higher first)
  const sorted = [...images].sort((a, b) => b.priority - a.priority);
  
  const queue = [...sorted];
  const loading: Promise<void>[] = [];
  
  while (queue.length > 0 || loading.length > 0) {
    // Start new loads up to maxConcurrent
    while (loading.length < maxConcurrent && queue.length > 0) {
      const item = queue.shift()!;
      const promise = preloadImage(item.src)
        .catch(err => console.error(`Failed to preload ${item.src}:`, err))
        .finally(() => {
          const index = loading.indexOf(promise);
          if (index > -1) loading.splice(index, 1);
        });
      loading.push(promise);
    }
    
    // Wait for at least one to complete
    if (loading.length > 0) {
      await Promise.race(loading);
    }
  }
};

/**
 * Generate responsive image sizes string
 */
export const generateSizesAttribute = (breakpoints: {
  mobile: string;
  tablet: string;
  desktop: string;
}): string => {
  return `
    (max-width: 767px) ${breakpoints.mobile},
    (max-width: 1023px) ${breakpoints.tablet},
    ${breakpoints.desktop}
  `.trim();
};

export default {
  generateSrcSet,
  supportsWebP,
  getOptimalImageFormat,
  toWebPIfSupported,
  lazyLoadImage,
  preloadImage,
  preloadImages,
  getImageDimensions,
  buildOptimizedImageUrl,
  createBlurPlaceholder,
  ProgressiveImageLoader,
  isImageCached,
  estimateImageSize,
  createPictureElement,
  batchPreloadImages,
  generateSizesAttribute,
};
