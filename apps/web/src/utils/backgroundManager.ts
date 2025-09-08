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
  
  // Save to localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('pokeduel-background', background);
  }
  
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    
    // Remove existing background classes
    html.classList.remove('bg-day', 'bg-afternoon');
    
    // Add the new background class
    const className = `bg-${background}`;
    html.classList.add(className);
    
    // Handle dark mode for afternoon background
    if (background === 'afternoon') {
      html.classList.add('dark');
      console.log('🌙 Dark mode activated with afternoon background');
    } else {
      html.classList.remove('dark');
      console.log('☀️ Dark mode deactivated with day background');
    }
    
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
  
  // Load saved background from localStorage or default to 'day'
  let savedBackground: BackgroundType = 'day';
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pokeduel-background');
    if (saved === 'day' || saved === 'afternoon') {
      savedBackground = saved;
    }
  }
  
  // Ensure DOM is ready before applying background
  if (typeof document !== 'undefined') {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setBackground(savedBackground);
      console.log(`🎨 Background initialized with ${savedBackground} theme`);
    });
  } else {
    // Fallback for SSR
    setBackground(savedBackground);
    console.log(`🎨 Background initialized with ${savedBackground} theme`);
  }
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