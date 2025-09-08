'use client';

type BackgroundType = 'day' | 'afternoon';

let currentBackground: BackgroundType = 'day';
let backgroundChangeListeners: (() => void)[] = [];

export const getBackgroundImage = (background: BackgroundType): string => {
  switch (background) {
    case 'day':
      return '/day.jpg';
    case 'afternoon':
      return '/afternoon.jpg';
    default:
      return '/day.jpg';
  }
};

export const getCurrentBackground = (): BackgroundType => {
  return currentBackground;
};

export const getCurrentBackgroundImage = (): string => {
  return getBackgroundImage(currentBackground);
};

export const setBackground = (background: BackgroundType): void => {
  console.log(`🎨 Setting background to: ${background}`);
  currentBackground = background;
  
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    
    // Remove existing background classes
    html.classList.remove('bg-day', 'bg-afternoon');
    
    // Add the new background class
    const className = `bg-${background}`;
    html.classList.add(className);
    
    console.log(`🎨 Applied CSS class: ${className}`);
  } else {
    console.log('🎨 Document not available (SSR)');
  }
  
  // Notify listeners
  backgroundChangeListeners.forEach(listener => listener());
};

export const toggleBackground = (): void => {
  const newBackground = currentBackground === 'day' ? 'afternoon' : 'day';
  setBackground(newBackground);
};

export const initializeBackground = (): void => {
  console.log('🎨 Initializing background system...');
  // Set initial background
  setBackground('day');
  console.log('🎨 Background initialized with day theme');
};

export const addBackgroundChangeListener = (listener: () => void): void => {
  backgroundChangeListeners.push(listener);
};

export const removeBackgroundChangeListener = (listener: () => void): void => {
  backgroundChangeListeners = backgroundChangeListeners.filter(l => l !== listener);
};

export const getBackgroundDisplayName = (background: BackgroundType): string => {
  switch (background) {
    case 'day':
      return 'Day';
    case 'afternoon':
      return 'Afternoon';
    default:
      return 'Day';
  }
};