# Quick Start Guide - Privacy Jenga Enhancements

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd apps/web
npm install
```

### 2. Generate PWA Icons
You need to create icon files before PWA installation will work:

```bash
# Option 1: Use pwa-asset-generator (recommended)
npx pwa-asset-generator src/assets/logo.svg public/icons --manifest public/manifest.json

# Option 2: Use online tool
# Visit https://realfavicongenerator.net/
# Upload your logo and download all sizes
# Place in public/icons/ folder
```

Required icon sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### 3. Build and Test
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 4. Test PWA Installation
1. Open your app in Chrome/Edge (desktop or mobile)
2. Look for install prompt in address bar
3. Click "Install" to add to home screen
4. Test offline functionality

---

## 📱 Testing Mobile Features

### Test Gesture Tutorial
1. Clear localStorage: `localStorage.removeItem('gesture_tutorial_completed')`
2. Reload page on mobile device
3. Tutorial should appear automatically
4. Follow the steps and complete

### Test Network Detection
```javascript
// In browser console
import networkQualityService from './src/services/networkQualityService.ts';

// Check current network quality
console.log(networkQualityService.getNetworkInfo());

// Get adaptive settings
console.log(networkQualityService.getAdaptiveSettings());
```

### Test Analytics
```javascript
// View tracked events
import analyticsService from './src/services/analyticsService.ts';

// See all events
console.log(analyticsService.getEvents());

// Export full report
console.log(analyticsService.exportReport());
```

---

## 🔧 Configuration

### Enable/Disable Features

#### Disable Gesture Tutorial:
```typescript
// In GamePage.tsx
const [showGestureTutorial, setShowGestureTutorial] = useState(false);
// Or set: localStorage.setItem('gesture_tutorial_completed', 'true');
```

#### Customize Network Thresholds:
```typescript
// In networkQualityService.ts
// Modify the thresholds object in shouldLoadAsset()
```

#### Adjust Loading Time:
```typescript
// In GamePage.tsx initializeGame()
// Change the timeout value:
await new Promise(resolve => setTimeout(resolve, 800)); // milliseconds
```

---

## 🎨 Customization

### Skeleton Loader Colors:
Edit `src/components/SkeletonLoader.tsx`:
```typescript
// Change gradient colors
className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
// Change animation colors
className="bg-gradient-to-br from-teal-500 to-teal-700"
```

### Gesture Tutorial Steps:
Edit `src/components/mobile/MobileGestureTutorial.tsx`:
```typescript
const steps = [
  // Add/remove/modify steps here
  { icon: Hand, title: '...', description: '...' }
];
```

### Analytics Endpoints:
Edit `src/services/analyticsService.ts`:
```typescript
private async sendToAnalytics(event: AnalyticsEvent) {
  // Add your analytics endpoint here
  await fetch('YOUR_ENDPOINT', {
    method: 'POST',
    body: JSON.stringify(event)
  });
}
```

---

## 📊 Monitoring Performance

### Check FPS in Real-time:
The PerformanceMonitor component already tracks FPS. To view:
```typescript
// Analytics service tracks low FPS automatically
analyticsService.trackFPS(currentFPS);
```

### Monitor Bundle Size:
```bash
npm run build

# Check dist folder
ls -lh apps/web/dist/assets
```

### Test on Different Networks:
1. Open Chrome DevTools
2. Go to Network tab
3. Change throttling: Fast 3G, Slow 3G, Offline
4. Reload and observe behavior

---

## 🐛 Troubleshooting

### PWA Not Installing:
- ✅ Check HTTPS is enabled
- ✅ Verify manifest.json is accessible
- ✅ Ensure all icons exist
- ✅ Check service worker registered
- ✅ Open DevTools > Application > Manifest

### Gesture Tutorial Not Showing:
```javascript
// Clear the flag
localStorage.removeItem('gesture_tutorial_completed');
// Reload on mobile device
```

### Analytics Not Tracking:
```javascript
// Check console for analytics logs
// Verify events are being created
console.log(analyticsService.getEvents());
```

### Images Not Loading:
- Check image paths are correct
- Verify WebP format is supported
- Test with JPEG fallback
- Check network throttling isn't too aggressive

---

## 🎯 Best Practices

### Performance:
- ✅ Use skeleton loaders for all async content
- ✅ Lazy load non-critical components
- ✅ Preload critical assets only
- ✅ Monitor FPS and adjust quality dynamically

### Mobile:
- ✅ Test on real devices, not just emulators
- ✅ Test with different network speeds
- ✅ Verify touch gestures work smoothly
- ✅ Check different screen sizes

### Analytics:
- ✅ Track key user journeys
- ✅ Monitor performance metrics
- ✅ Respect user privacy
- ✅ Provide opt-out mechanism

---

## 📚 Additional Resources

### Learn More:
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Performance](https://web.dev/performance/)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)

### Tools:
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [WebPageTest](https://www.webpagetest.org/) - Detailed performance testing
- [Can I Use](https://caniuse.com/) - Browser compatibility checking

---

## ✅ Checklist Before Deployment

- [ ] Generate all PWA icons
- [ ] Test PWA installation on iOS and Android
- [ ] Verify service worker caching
- [ ] Test offline functionality
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Test on real mobile devices
- [ ] Verify gesture tutorial works
- [ ] Check analytics tracking
- [ ] Test with slow network connections
- [ ] Ensure HTTPS is enabled
- [ ] Review and update manifest.json info
- [ ] Test loading states on slow connections
- [ ] Verify error boundaries catch errors
- [ ] Check responsive design on all breakpoints

---

## 🆘 Need Help?

### Common Issues:

**Q: Icons not loading?**
A: Generate icons using the guide in `public/icons/README.md`

**Q: Service worker not registering?**
A: Check browser console for errors and ensure HTTPS

**Q: Gesture tutorial showing every time?**
A: Check localStorage is working and not being cleared

**Q: Poor performance on mobile?**
A: Verify device detection is working and quality is being adjusted

**Q: Analytics not sending data?**
A: Implement the sendToAnalytics() method with your endpoint

---

## 🎉 You're All Set!

Your Privacy Jenga app is now equipped with:
- ✨ Professional loading states
- 📱 Mobile gesture tutorial
- 📊 Comprehensive analytics
- 🌐 Network-aware optimization
- 🚀 PWA capabilities
- 🎨 Image optimization

Build, test, and deploy with confidence!
