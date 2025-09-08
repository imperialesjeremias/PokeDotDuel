// Background music utility for the Pokemon game

let audioInstance: HTMLAudioElement | null = null;
let isPlaying = false;

export const initBackgroundMusic = () => {
  if (typeof window === 'undefined') return; // Server-side check
  
  if (!audioInstance) {
    audioInstance = new Audio('/soundtrack.mp3');
    audioInstance.loop = true;
    audioInstance.volume = 0.3; // Set to 30% volume
    
    // Handle audio loading errors
    audioInstance.addEventListener('error', (e) => {
      console.warn('Background music failed to load:', e);
    });
  }
};

export const playBackgroundMusic = async () => {
  if (!audioInstance) {
    initBackgroundMusic();
    if (!audioInstance) return;
  }
  
  try {
    // Check if audio is already playing
    if (isPlaying && !audioInstance.paused) {
      return;
    }
    
    await audioInstance.play();
    isPlaying = true;
  } catch (error) {
    console.warn('Could not play background music:', error);
  }
};

export const pauseBackgroundMusic = () => {
  if (audioInstance && isPlaying) {
    audioInstance.pause();
    isPlaying = false;
  }
};

export const toggleBackgroundMusic = async () => {
  if (isPlaying) {
    pauseBackgroundMusic();
  } else {
    await playBackgroundMusic();
  }
};

export const setVolume = (volume: number) => {
  if (audioInstance) {
    audioInstance.volume = Math.max(0, Math.min(1, volume));
  }
};

export const isBackgroundMusicPlaying = () => isPlaying;