// Sound Manager for Privacy Jenga Game
// Handles all audio effects, background music, and sound settings

export interface SoundSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  enabled: boolean;
}

export interface AudioTrack {
  id: string;
  src: string;
  volume: number;
  loop: boolean;
  type: 'music' | 'sfx';
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private music: HTMLAudioElement | null = null;
  private settings: SoundSettings = {
    masterVolume: 0.3,
    musicVolume: 0.2,
    sfxVolume: 0.4,
    enabled: true
  };

  // Get base URL for assets (handles GitHub Pages base path)
  private getAssetPath(path: string): string {
    const base = import.meta.env.BASE_URL || '/';
    return `${base}${path.startsWith('/') ? path.slice(1) : path}`;
  }

  // Audio tracks configuration
  private readonly audioTracks: AudioTrack[] = [
    // Background Music
    {
      id: 'background-music',
      src: '/audio/background-music.wav',
      volume: 0.2,
      loop: true,
      type: 'music'
    },
    {
      id: 'ambient-music',
      src: '/audio/ambient-music.wav',
      volume: 0.15,
      loop: true,
      type: 'music'
    },
    
    // Game Sound Effects
    {
      id: 'block-click',
      src: '/audio/block-click.wav',
      volume: 0.3,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'block-remove',
      src: '/audio/block-remove.wav',
      volume: 0.35,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'correct-answer',
      src: '/audio/correct-answer.wav',
      volume: 0.4,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'wrong-answer',
      src: '/audio/wrong-answer.wav',
      volume: 0.3,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'tower-shake',
      src: '/audio/tower-shake.wav',
      volume: 0.25,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'tower-collapse',
      src: '/audio/tower-collapse.wav',
      volume: 0.45,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'achievement-unlock',
      src: '/audio/achievement-unlock.wav',
      volume: 0.4,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'stability-warning',
      src: '/audio/stability-warning.wav',
      volume: 0.3,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'button-hover',
      src: '/audio/button-hover.wav',
      volume: 0.15,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'button-click',
      src: '/audio/button-click.wav',
      volume: 0.25,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'game-start',
      src: '/audio/game-start.wav',
      volume: 0.35,
      loop: false,
      type: 'sfx'
    },
    {
      id: 'game-complete',
      src: '/audio/game-complete.wav',
      volume: 0.4,
      loop: false,
      type: 'sfx'
    }
  ];

  constructor() {
    this.initializeAudioContext();
    this.loadSettings();
    this.preloadSounds();
    
    // Add user interaction handler for autoplay policies
    this.setupUserInteractionHandler();
  }

  private initializeAudioContext(): void {
    try {
      // Initialize Web Audio API context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 Audio context initialized');
    } catch (error) {
      console.warn('⚠️ Audio context initialization failed:', error);
    }
  }

  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('privacy-jenga-sound-settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.warn('⚠️ Failed to load sound settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('privacy-jenga-sound-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('⚠️ Failed to save sound settings:', error);
    }
  }

  private preloadSounds(): void {
    this.audioTracks.forEach(track => {
      this.loadSound(track);
    });
  }

  private loadSound(track: AudioTrack): void {
    const audioPath = this.getAssetPath(track.src);
    const audio = new Audio(audioPath);
    audio.preload = 'auto';
    audio.volume = this.getAdjustedVolume(track.volume, track.type);
    
    // Handle loading errors gracefully
    audio.addEventListener('error', (e) => {
      console.warn(`⚠️ Failed to load audio: ${audioPath} (original: ${track.src})`, e);
    });

    audio.addEventListener('canplaythrough', () => {
      console.log(`✅ Audio loaded: ${track.id}`);
    });

    this.sounds.set(track.id, audio);
  }

  private getAdjustedVolume(baseVolume: number, type: 'music' | 'sfx'): number {
    if (!this.settings.enabled) return 0;
    
    const typeVolume = type === 'music' ? this.settings.musicVolume : this.settings.sfxVolume;
    return (baseVolume * typeVolume * this.settings.masterVolume);
  }

  private setupUserInteractionHandler(): void {
    // Handle user interaction to enable audio on GitHub Pages
    const enableAudio = () => {
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('🎵 Audio context resumed after user interaction');
        }).catch(error => {
          console.warn('⚠️ Failed to resume audio context:', error);
        });
      }
    };

    // Listen for user interactions
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, enableAudio, { once: true });
    });
  }

  // Public API Methods

  public playSound(soundId: string): void {
    if (!this.settings.enabled) return;

    const sound = this.sounds.get(soundId);
    if (sound) {
      try {
        // Reset audio to beginning if it's already playing
        sound.currentTime = 0;
        sound.volume = this.getAdjustedVolume(
          this.audioTracks.find(t => t.id === soundId)?.volume || 0.5,
          this.audioTracks.find(t => t.id === soundId)?.type || 'sfx'
        );
        
        // Resume audio context if suspended
        if (this.audioContext?.state === 'suspended') {
          this.audioContext.resume();
        }
        
        // Add user interaction check for autoplay policies
        if (document.visibilityState === 'visible') {
          sound.play().catch(error => {
            console.warn(`⚠️ Failed to play sound ${soundId}:`, error);
            // Try to resume audio context if it failed
            if (this.audioContext?.state === 'suspended') {
              this.audioContext.resume().catch(e => {
                console.warn('⚠️ Failed to resume audio context:', e);
              });
            }
          });
        }
      } catch (error) {
        console.warn(`⚠️ Error playing sound ${soundId}:`, error);
      }
    } else {
      console.warn(`⚠️ Sound not found: ${soundId}`);
    }
  }

  public playMusic(musicId: string): void {
    if (!this.settings.enabled || this.settings.musicVolume === 0) return;

    // Stop current music
    this.stopMusic();

    const music = this.sounds.get(musicId);
    if (music) {
      try {
        music.volume = this.getAdjustedVolume(
          this.audioTracks.find(t => t.id === musicId)?.volume || 0.4,
          'music'
        );
        music.loop = true;
        
        // Add user interaction check for autoplay policies
        if (document.visibilityState === 'visible') {
          music.play().catch(error => {
            console.warn(`⚠️ Failed to play music ${musicId}:`, error);
            // Try to resume audio context if it failed
            if (this.audioContext?.state === 'suspended') {
              this.audioContext.resume().catch(e => {
                console.warn('⚠️ Failed to resume audio context:', e);
              });
            }
          });
          this.music = music;
        }
      } catch (error) {
        console.warn(`⚠️ Error playing music ${musicId}:`, error);
      }
    } else {
      console.warn(`⚠️ Music not found: ${musicId}`);
    }
  }

  public stopMusic(): void {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
      this.music = null;
    }
  }

  public pauseMusic(): void {
    if (this.music) {
      this.music.pause();
    }
  }

  public resumeMusic(): void {
    if (this.music && this.settings.enabled) {
      this.music.play().catch(error => {
        console.warn('⚠️ Failed to resume music:', error);
      });
    }
  }

  public updateSettings(newSettings: Partial<SoundSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Update volumes for all loaded sounds
    this.sounds.forEach((sound, soundId) => {
      const track = this.audioTracks.find(t => t.id === soundId);
      if (track) {
        sound.volume = this.getAdjustedVolume(track.volume, track.type);
      }
    });
  }

  public getSettings(): SoundSettings {
    return { ...this.settings };
  }

  public toggleSound(): void {
    this.settings.enabled = !this.settings.enabled;
    this.saveSettings();
    
    if (!this.settings.enabled) {
      this.stopMusic();
    } else if (this.music) {
      this.resumeMusic();
    }
  }

  // Game-specific sound methods
  public playBlockClick(): void {
    this.playSound('block-click');
  }

  public playBlockRemove(): void {
    this.playSound('block-remove');
  }

  public playCorrectAnswer(): void {
    this.playSound('correct-answer');
  }

  public playWrongAnswer(): void {
    this.playSound('wrong-answer');
  }

  public playTowerShake(): void {
    this.playSound('tower-shake');
  }

  public playTowerCollapse(): void {
    this.playSound('tower-collapse');
  }

  public playAchievementUnlock(): void {
    this.playSound('achievement-unlock');
  }

  public playStabilityWarning(): void {
    this.playSound('stability-warning');
  }

  public playButtonHover(): void {
    this.playSound('button-hover');
  }

  public playButtonClick(): void {
    this.playSound('button-click');
  }

  public playGameStart(): void {
    this.playSound('game-start');
  }

  public playGameComplete(): void {
    this.playSound('game-complete');
  }

  public startBackgroundMusic(): void {
    this.playMusic('background-music');
  }

  public startAmbientMusic(): void {
    this.playMusic('ambient-music');
  }

  public isAudioSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  public getAudioStatus(): string {
    if (!this.isAudioSupported()) {
      return 'Audio not supported';
    }
    if (!this.audioContext) {
      return 'Audio context not initialized';
    }
    return this.audioContext.state;
  }



  // Cleanup
  public destroy(): void {
    this.stopMusic();
    this.sounds.clear();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create singleton instance
export const soundManager = new SoundManager();
export default soundManager;
