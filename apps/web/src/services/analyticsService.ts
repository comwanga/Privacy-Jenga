/**
 * Analytics Tracking Service
 * Tracks performance, user behavior, and PWA metrics
 */

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
}

interface PerformanceMetrics {
  fps: number;
  loadTime: number;
  bundleSize: number;
  deviceType: string;
  connection: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private startTime: number;
  private pwaInstallPromptShown: boolean = false;
  private pwaInstalled: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    // Track PWA install prompt
    window.addEventListener('beforeinstallprompt', () => {
      this.pwaInstallPromptShown = true;
      this.trackEvent({
        category: 'PWA',
        action: 'install_prompt_shown',
        timestamp: Date.now(),
      });
    });

    // Track PWA installation
    window.addEventListener('appinstalled', () => {
      this.pwaInstalled = true;
      this.trackEvent({
        category: 'PWA',
        action: 'app_installed',
        timestamp: Date.now(),
      });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent({
        category: 'Engagement',
        action: document.hidden ? 'page_hidden' : 'page_visible',
        timestamp: Date.now(),
      });
    });

    // Track page load performance
    if (window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = window.performance.timing;
          const loadTime = perfData.loadEventEnd - perfData.navigationStart;
          
          this.trackEvent({
            category: 'Performance',
            action: 'page_load',
            label: 'load_time_ms',
            value: loadTime,
            timestamp: Date.now(),
          });
        }, 0);
      });
    }

    // Track network type
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.trackEvent({
        category: 'Device',
        action: 'connection_type',
        label: connection?.effectiveType || 'unknown',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Track custom event
   */
  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'> & { timestamp?: number }) {
    const trackedEvent: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };

    this.events.push(trackedEvent);
    console.log('[Analytics]', trackedEvent);

    // Store in localStorage for offline sync
    this.storeOffline(trackedEvent);

    // Send to analytics service if online
    if (navigator.onLine) {
      this.sendToAnalytics(trackedEvent);
    }
  }

  /**
   * Track game events
   */
  trackGameEvent(action: string, label?: string, value?: number) {
    this.trackEvent({
      category: 'Game',
      action,
      label,
      value,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: Partial<PerformanceMetrics>) {
    this.trackEvent({
      category: 'Performance',
      action: 'metrics_recorded',
      label: JSON.stringify(metrics),
      value: metrics.fps,
    });
  }

  /**
   * Track FPS
   */
  trackFPS(fps: number) {
    // Only track significant FPS drops
    if (fps < 30) {
      this.trackEvent({
        category: 'Performance',
        action: 'low_fps',
        label: `${fps}_fps`,
        value: fps,
      });
    }
  }

  /**
   * Track bundle load time
   */
  trackBundleLoad(chunkName: string, loadTime: number) {
    this.trackEvent({
      category: 'Performance',
      action: 'chunk_loaded',
      label: chunkName,
      value: loadTime,
    });
  }

  /**
   * Track PWA install prompt acceptance
   */
  trackPWAInstallPrompt(accepted: boolean) {
    this.trackEvent({
      category: 'PWA',
      action: accepted ? 'install_accepted' : 'install_dismissed',
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string) {
    this.trackEvent({
      category: 'Interaction',
      action,
      label: element,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string) {
    this.trackEvent({
      category: 'Error',
      action: error.name,
      label: `${context || 'unknown'}: ${error.message}`,
    });
  }

  /**
   * Track touch gesture
   */
  trackGesture(gestureType: string, success: boolean) {
    this.trackEvent({
      category: 'Gesture',
      action: gestureType,
      label: success ? 'success' : 'failed',
    });
  }

  /**
   * Track game completion
   */
  trackGameCompletion(score: number, duration: number, onMobile: boolean) {
    this.trackEvent({
      category: 'Game',
      action: 'game_completed',
      label: onMobile ? 'mobile' : 'desktop',
      value: score,
    });

    this.trackEvent({
      category: 'Game',
      action: 'game_duration',
      label: onMobile ? 'mobile' : 'desktop',
      value: duration,
    });
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get all events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get PWA metrics
   */
  getPWAMetrics() {
    return {
      installPromptShown: this.pwaInstallPromptShown,
      installed: this.pwaInstalled,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    };
  }

  /**
   * Store event offline for later sync
   */
  private storeOffline(event: AnalyticsEvent) {
    try {
      const offlineEvents = JSON.parse(
        localStorage.getItem('analytics_offline') || '[]'
      );
      offlineEvents.push(event);
      
      // Keep only last 100 events
      if (offlineEvents.length > 100) {
        offlineEvents.shift();
      }
      
      localStorage.setItem('analytics_offline', JSON.stringify(offlineEvents));
    } catch (error) {
      console.error('[Analytics] Failed to store offline:', error);
    }
  }

  /**
   * Send event to analytics service
   */
  private async sendToAnalytics(event: AnalyticsEvent) {
    // TODO: Implement actual analytics endpoint
    // For now, just log to console
    
    // Example: Send to Google Analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }

    // Example: Send to custom endpoint
    /*
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          event,
        }),
      });
    } catch (error) {
      console.error('[Analytics] Failed to send event:', error);
    }
    */
  }

  /**
   * Sync offline events when back online
   */
  async syncOfflineEvents() {
    if (!navigator.onLine) return;

    try {
      const offlineEvents = JSON.parse(
        localStorage.getItem('analytics_offline') || '[]'
      );

      if (offlineEvents.length === 0) return;

      console.log(`[Analytics] Syncing ${offlineEvents.length} offline events`);

      for (const event of offlineEvents) {
        await this.sendToAnalytics(event);
      }

      // Clear offline storage after successful sync
      localStorage.removeItem('analytics_offline');
    } catch (error) {
      console.error('[Analytics] Failed to sync offline events:', error);
    }
  }

  /**
   * Clear all events (for privacy/testing)
   */
  clearEvents() {
    this.events = [];
    localStorage.removeItem('analytics_offline');
  }

  /**
   * Export analytics report
   */
  exportReport() {
    const report = {
      sessionId: this.sessionId,
      sessionDuration: this.getSessionDuration(),
      pwaMetrics: this.getPWAMetrics(),
      events: this.getEvents(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        deviceMemory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
      },
    };

    return report;
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Sync offline events when coming back online
window.addEventListener('online', () => {
  analyticsService.syncOfflineEvents();
});

export default analyticsService;
