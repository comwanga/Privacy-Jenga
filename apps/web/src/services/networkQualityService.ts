/**
 * Network Quality Detection and Adaptive Loading
 * Adjusts content delivery based on connection speed
 */

export type NetworkQuality = 'offline' | 'slow-2g' | '2g' | '3g' | '4g' | 'fast';
export type DataSaver = 'enabled' | 'disabled' | 'unknown';

interface NetworkInfo {
  quality: NetworkQuality;
  effectiveType: string;
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: DataSaver;
  isOnline: boolean;
}

interface AdaptiveSettings {
  imageQuality: 'low' | 'medium' | 'high';
  videoAutoplay: boolean;
  prefetchAssets: boolean;
  use3DEffects: boolean;
  enableAnimations: boolean;
  maxTextureSize: number;
  particleCount: number;
}

class NetworkQualityService {
  private networkInfo: NetworkInfo;
  private listeners: Array<(info: NetworkInfo) => void> = [];
  private qualityCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.networkInfo = this.detectNetworkQuality();
    this.initializeListeners();
    this.startMonitoring();
  }

  /**
   * Detect current network quality
   */
  private detectNetworkQuality(): NetworkInfo {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (!connection) {
      return {
        quality: 'fast',
        effectiveType: 'unknown',
        downlink: 10,
        rtt: 50,
        saveData: 'unknown',
        isOnline: navigator.onLine,
      };
    }

    const effectiveType = connection.effectiveType || '4g';
    const downlink = connection.downlink || 10; // Mbps
    const rtt = connection.rtt || 50; // ms
    const saveData = connection.saveData ? 'enabled' : 'disabled';

    let quality: NetworkQuality;

    if (!navigator.onLine) {
      quality = 'offline';
    } else if (effectiveType === 'slow-2g') {
      quality = 'slow-2g';
    } else if (effectiveType === '2g') {
      quality = '2g';
    } else if (effectiveType === '3g') {
      quality = '3g';
    } else if (effectiveType === '4g' && downlink > 5) {
      quality = 'fast';
    } else {
      quality = '4g';
    }

    return {
      quality,
      effectiveType,
      downlink,
      rtt,
      saveData,
      isOnline: navigator.onLine,
    };
  }

  /**
   * Initialize network change listeners
   */
  private initializeListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.updateNetworkInfo();
    });

    window.addEventListener('offline', () => {
      this.updateNetworkInfo();
    });

    // Listen for connection changes
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', () => {
        this.updateNetworkInfo();
      });
    }
  }

  /**
   * Start periodic network quality checks
   */
  private startMonitoring() {
    // Check network quality every 30 seconds
    this.qualityCheckInterval = setInterval(() => {
      this.updateNetworkInfo();
    }, 30000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
      this.qualityCheckInterval = null;
    }
  }

  /**
   * Update network info and notify listeners
   */
  private updateNetworkInfo() {
    const oldQuality = this.networkInfo.quality;
    this.networkInfo = this.detectNetworkQuality();

    console.log('[Network] Quality updated:', this.networkInfo);

    // Notify listeners if quality changed
    if (oldQuality !== this.networkInfo.quality) {
      this.notifyListeners();
    }
  }

  /**
   * Subscribe to network quality changes
   */
  subscribe(callback: (info: NetworkInfo) => void) {
    this.listeners.push(callback);
    
    // Immediately call with current info
    callback(this.networkInfo);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.networkInfo));
  }

  /**
   * Get current network info
   */
  getNetworkInfo(): NetworkInfo {
    return { ...this.networkInfo };
  }

  /**
   * Get adaptive settings based on network quality
   */
  getAdaptiveSettings(): AdaptiveSettings {
    const { quality, saveData } = this.networkInfo;

    // Ultra-conservative for data saver or poor connections
    if (saveData === 'enabled' || quality === 'offline' || quality === 'slow-2g') {
      return {
        imageQuality: 'low',
        videoAutoplay: false,
        prefetchAssets: false,
        use3DEffects: false,
        enableAnimations: false,
        maxTextureSize: 512,
        particleCount: 0,
      };
    }

    // Conservative for 2G
    if (quality === '2g') {
      return {
        imageQuality: 'low',
        videoAutoplay: false,
        prefetchAssets: false,
        use3DEffects: false,
        enableAnimations: true,
        maxTextureSize: 1024,
        particleCount: 5,
      };
    }

    // Moderate for 3G
    if (quality === '3g') {
      return {
        imageQuality: 'medium',
        videoAutoplay: false,
        prefetchAssets: true,
        use3DEffects: true,
        enableAnimations: true,
        maxTextureSize: 1024,
        particleCount: 15,
      };
    }

    // Normal for 4G
    if (quality === '4g') {
      return {
        imageQuality: 'medium',
        videoAutoplay: true,
        prefetchAssets: true,
        use3DEffects: true,
        enableAnimations: true,
        maxTextureSize: 2048,
        particleCount: 25,
      };
    }

    // Full quality for fast connections
    return {
      imageQuality: 'high',
      videoAutoplay: true,
      prefetchAssets: true,
      use3DEffects: true,
      enableAnimations: true,
      maxTextureSize: 2048,
      particleCount: 50,
    };
  }

  /**
   * Check if network is fast enough for feature
   */
  canUseFeature(feature: 'video' | '3d' | 'animations' | 'prefetch'): boolean {
    const settings = this.getAdaptiveSettings();

    switch (feature) {
      case 'video':
        return settings.videoAutoplay;
      case '3d':
        return settings.use3DEffects;
      case 'animations':
        return settings.enableAnimations;
      case 'prefetch':
        return settings.prefetchAssets;
      default:
        return true;
    }
  }

  /**
   * Get recommended image format
   */
  getRecommendedImageFormat(): 'webp' | 'jpeg' | 'png' {
    const { quality } = this.networkInfo;

    // WebP for good connections (smaller file size)
    if (['4g', 'fast'].includes(quality)) {
      return 'webp';
    }

    // JPEG for slower connections (widely supported, decent compression)
    return 'jpeg';
  }

  /**
   * Estimate download time for asset
   */
  estimateDownloadTime(sizeInBytes: number): number {
    const { downlink } = this.networkInfo;
    
    if (!downlink || downlink === 0) return 5000; // Default 5 seconds
    
    // Convert Mbps to bytes per second
    const bytesPerSecond = (downlink * 1000000) / 8;
    
    // Calculate time in milliseconds
    const timeInMs = (sizeInBytes / bytesPerSecond) * 1000;
    
    return Math.ceil(timeInMs);
  }

  /**
   * Should load asset based on size and priority
   */
  shouldLoadAsset(sizeInBytes: number, priority: 'low' | 'medium' | 'high'): boolean {
    const { quality, saveData } = this.networkInfo;

    // Never load non-essential on data saver
    if (saveData === 'enabled' && priority === 'low') {
      return false;
    }

    // Size thresholds based on network quality
    const thresholds = {
      'offline': 0,
      'slow-2g': priority === 'high' ? 100000 : 0, // 100KB max
      '2g': priority === 'high' ? 250000 : priority === 'medium' ? 100000 : 0,
      '3g': priority === 'high' ? 1000000 : priority === 'medium' ? 500000 : 250000,
      '4g': priority === 'high' ? 5000000 : priority === 'medium' ? 2000000 : 1000000,
      'fast': Infinity, // No limit
    };

    return sizeInBytes <= thresholds[quality];
  }

  /**
   * Get network quality indicator for UI
   */
  getQualityIndicator(): { label: string; color: string; icon: string } {
    const { quality } = this.networkInfo;

    const indicators = {
      'offline': { label: 'Offline', color: 'red', icon: '📵' },
      'slow-2g': { label: 'Very Slow', color: 'red', icon: '🐌' },
      '2g': { label: 'Slow', color: 'orange', icon: '🚶' },
      '3g': { label: 'Moderate', color: 'yellow', icon: '🚴' },
      '4g': { label: 'Good', color: 'green', icon: '🚗' },
      'fast': { label: 'Excellent', color: 'green', icon: '🚀' },
    };

    return indicators[quality];
  }
}

// Create singleton instance
const networkQualityService = new NetworkQualityService();

export default networkQualityService;
