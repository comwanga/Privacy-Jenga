/**
 * Device Detection and Performance Capability Detection
 * Helps optimize 3D rendering based on device capabilities
 */

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLowEnd: boolean;
  isMidRange: boolean;
  isHighEnd: boolean;
  supportsWebGL2: boolean;
  maxTextureSize: number;
  gpuTier: 'low' | 'medium' | 'high';
  recommendedQuality: 'low' | 'medium' | 'high';
  cores: number;
  memory: number; // in GB
}

/**
 * Detect device capabilities for performance optimization
 */
export const detectDeviceCapabilities = (): DeviceCapabilities => {
  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
  const isDesktop = !isMobile && !isTablet;

  // Detect hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4;

  // Estimate device memory
  const memory = (navigator as any).deviceMemory || 4; // GB

  // Check WebGL2 support
  const canvas = document.createElement('canvas');
  const gl2 = canvas.getContext('webgl2');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const supportsWebGL2 = !!gl2;

  // Get max texture size
  let maxTextureSize = 2048; // default fallback
  if (gl2) {
    maxTextureSize = (gl2 as WebGL2RenderingContext).getParameter(
      (gl2 as WebGL2RenderingContext).MAX_TEXTURE_SIZE
    );
  } else if (gl) {
    maxTextureSize = (gl as WebGLRenderingContext).getParameter(
      (gl as WebGLRenderingContext).MAX_TEXTURE_SIZE
    );
  }

  // Determine device tier based on multiple factors
  let gpuTier: 'low' | 'medium' | 'high' = 'medium';
  let isLowEnd = false;
  let isMidRange = false;
  let isHighEnd = false;

  if (isMobile) {
    // Mobile device classification
    if (cores <= 4 && memory <= 2) {
      gpuTier = 'low';
      isLowEnd = true;
    } else if (cores <= 6 && memory <= 4) {
      gpuTier = 'medium';
      isMidRange = true;
    } else {
      gpuTier = 'high';
      isHighEnd = true;
    }
  } else {
    // Desktop device classification
    if (cores <= 2 && memory <= 4) {
      gpuTier = 'low';
      isLowEnd = true;
    } else if (cores <= 4 && memory <= 8) {
      gpuTier = 'medium';
      isMidRange = true;
    } else {
      gpuTier = 'high';
      isHighEnd = true;
    }
  }

  // Adjust for WebGL2 support
  if (!supportsWebGL2 && gpuTier === 'high') {
    gpuTier = 'medium';
    isHighEnd = false;
    isMidRange = true;
  }

  // Recommended quality settings
  let recommendedQuality: 'low' | 'medium' | 'high' = gpuTier;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLowEnd,
    isMidRange,
    isHighEnd,
    supportsWebGL2,
    maxTextureSize,
    gpuTier,
    recommendedQuality,
    cores,
    memory,
  };
};

/**
 * Get optimal 3D rendering settings based on device
 */
export const getOptimalRenderSettings = (capabilities: DeviceCapabilities) => {
  const { gpuTier, isMobile, supportsWebGL2 } = capabilities;

  // Base settings for low-end devices
  if (gpuTier === 'low') {
    return {
      antialias: false,
      shadows: false,
      pixelRatio: Math.min(window.devicePixelRatio, 1),
      maxLights: 2,
      shadowMapSize: 256,
      anisotropy: 1,
      toneMapping: false,
      postProcessing: false,
      particleCount: 10,
      maxFPS: 30,
      lodEnabled: true,
      lodDistances: [5, 15, 30],
    };
  }

  // Mid-range device settings
  if (gpuTier === 'medium') {
    return {
      antialias: !isMobile,
      shadows: !isMobile,
      pixelRatio: Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
      maxLights: 3,
      shadowMapSize: 512,
      anisotropy: 2,
      toneMapping: true,
      postProcessing: false,
      particleCount: 25,
      maxFPS: 60,
      lodEnabled: true,
      lodDistances: [10, 25, 50],
    };
  }

  // High-end device settings
  return {
    antialias: true,
    shadows: true,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    maxLights: 5,
    shadowMapSize: 1024,
    anisotropy: supportsWebGL2 ? 4 : 2,
    toneMapping: true,
    postProcessing: true,
    particleCount: 50,
    maxFPS: 120,
    lodEnabled: false,
    lodDistances: [15, 35, 70],
  };
};

/**
 * Performance monitoring and adjustment
 */
export class PerformanceManager {
  private fpsHistory: number[] = [];
  private maxHistoryLength = 60; // 1 second at 60fps
  private currentQuality: 'low' | 'medium' | 'high';
  private capabilities: DeviceCapabilities;

  constructor() {
    this.capabilities = detectDeviceCapabilities();
    this.currentQuality = this.capabilities.recommendedQuality;
  }

  recordFrame(fps: number) {
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.maxHistoryLength) {
      this.fpsHistory.shift();
    }
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  shouldReduceQuality(): boolean {
    const avgFps = this.getAverageFPS();
    const targetFps = this.capabilities.isMobile ? 30 : 45;
    
    return avgFps < targetFps && this.fpsHistory.length >= 30;
  }

  shouldIncreaseQuality(): boolean {
    const avgFps = this.getAverageFPS();
    const targetFps = this.capabilities.isMobile ? 55 : 58;
    
    return avgFps > targetFps && this.fpsHistory.length >= 60;
  }

  adjustQuality(): 'low' | 'medium' | 'high' | null {
    if (this.shouldReduceQuality()) {
      if (this.currentQuality === 'high') {
        this.currentQuality = 'medium';
        return 'medium';
      } else if (this.currentQuality === 'medium') {
        this.currentQuality = 'low';
        return 'low';
      }
    } else if (this.shouldIncreaseQuality()) {
      if (this.currentQuality === 'low') {
        this.currentQuality = 'medium';
        return 'medium';
      } else if (this.currentQuality === 'medium' && !this.capabilities.isMobile) {
        this.currentQuality = 'high';
        return 'high';
      }
    }
    
    return null;
  }

  getCurrentQuality(): 'low' | 'medium' | 'high' {
    return this.currentQuality;
  }

  getCapabilities(): DeviceCapabilities {
    return this.capabilities;
  }
}

export default {
  detectDeviceCapabilities,
  getOptimalRenderSettings,
  PerformanceManager,
};
