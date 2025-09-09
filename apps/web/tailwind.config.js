/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      sans: ['var(--font-inter)', 'sans-serif'],
      pixel: ['var(--font-pixel)', 'monospace'],
      'pokemon-solid': ['Pokemon Solid', 'monospace'],
      'pokemon-hollow': ['Pokemon Hollow', 'monospace'],
      'pokemon-classic': ['Pokemon Classic', 'monospace'],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Game Boy Color Palette
        'gameboy': {
          'darkest': '#0f380f',  // Darkest green
          'dark': '#306230',     // Dark green
          'light': '#8bac0f',    // Light green
          'lightest': '#9bbc0f', // Lightest green
          'bg': '#c4cfa1',       // Background color
        },
        // Pokemon Game Version Palettes
        'pokemon-red': {
          'primary': '#FF1111',
          'secondary': '#CC0000',
          'accent': '#FF6666',
          'bg': '#FFEEEE',
          'text': '#330000',
        },
        'pokemon-blue': {
          'primary': '#1155FF',
          'secondary': '#0033CC',
          'accent': '#6699FF',
          'bg': '#EEEEFF',
          'text': '#000033',
        },
        'pokemon-yellow': {
          'primary': '#FFDD00',
          'secondary': '#CCAA00',
          'accent': '#FFEE66',
          'bg': '#FFFFEE',
          'text': '#333300',
        },
        // Pokemon Center/Mart Colors
        'pokecenter': {
          'red': '#FF6B6B',
          'white': '#FFFFFF',
          'blue': '#4ECDC4',
          'pink': '#FFB3BA',
        },
        // Battle UI Colors
        'battle': {
          'hp-green': '#00FF00',
          'hp-yellow': '#FFFF00',
          'hp-red': '#FF0000',
          'exp-blue': '#0080FF',
          'border': '#000000',
        },
        // Pokemon type colors
        'type-normal': '#A8A878',
        'type-fire': '#F08030',
        'type-water': '#6890F0',
        'type-electric': '#F8D030',
        'type-grass': '#78C850',
        'type-ice': '#98D8D8',
        'type-fighting': '#C03028',
        'type-poison': '#A040A0',
        'type-ground': '#E0C068',
        'type-flying': '#A890F0',
        'type-psychic': '#F85888',
        'type-bug': '#A8B820',
        'type-rock': '#B8A038',
        'type-ghost': '#705898',
        'type-dragon': '#7038F8',
        // Rarity colors
        'rarity-common': '#9CA3AF',
        'rarity-rare': '#3B82F6',
        'rarity-legendary': '#F59E0B',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "card-flip": {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        "pack-open": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.1) rotate(5deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        "battle-damage": {
          "0%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
          "100%": { transform: "translateX(0)" },
        },
        "pixel-fade": {
          "0%": { opacity: 0 },
          "10%": { opacity: 0.1 },
          "20%": { opacity: 0.2 },
          "30%": { opacity: 0.3 },
          "40%": { opacity: 0.4 },
          "50%": { opacity: 0.5 },
          "60%": { opacity: 0.6 },
          "70%": { opacity: 0.7 },
          "80%": { opacity: 0.8 },
          "90%": { opacity: 0.9 },
          "100%": { opacity: 1 },
        },
        "pixel-step": {
          "0%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(2px)" },
          "50%": { transform: "translateX(0)" },
          "75%": { transform: "translateX(-2px)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "card-flip": "card-flip 0.6s ease-in-out",
        "pack-open": "pack-open 0.5s ease-in-out",
        "battle-damage": "battle-damage 0.3s ease-in-out",
        "pixel-fade": "pixel-fade 0.5s steps(10)",
        "pixel-step": "pixel-step 0.5s steps(4) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
