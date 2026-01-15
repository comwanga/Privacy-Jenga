import { useEffect, useState } from 'react';

interface PWAInstallPrompt {
  showInstallPrompt: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  installationStatus: 'not-available' | 'available' | 'installed' | 'dismissed';
}

export const usePWAInstall = (): PWAInstallPrompt => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installationStatus, setInstallationStatus] = useState<
    'not-available' | 'available' | 'installed' | 'dismissed'
  >('not-available');

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setInstallationStatus('installed');
        return true;
      }
      
      // Check for iOS Safari
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        setInstallationStatus('installed');
        return true;
      }
      
      return false;
    };

    // Early return if already installed
    if (checkIfInstalled()) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
      setInstallationStatus('available');
      
      console.log('PWA install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallationStatus('installed');
      setDeferredPrompt(null);
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Note: Service Worker is automatically registered by vite-plugin-pwa
    // No manual registration needed

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        setInstallationStatus('installed');
      } else {
        setInstallationStatus('dismissed');
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setIsInstallable(false);
      
    } catch (error) {
      console.error('Error showing install prompt:', error);
      setInstallationStatus('not-available');
    }
  };

  return {
    showInstallPrompt,
    isInstallable,
    isInstalled,
    installationStatus,
  };
};
