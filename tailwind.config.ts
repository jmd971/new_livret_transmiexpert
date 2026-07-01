import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette de marque TransmiExpert V4
        forest: { DEFAULT: '#1F3A1A', light: '#2E5326' },
        ivory: { DEFAULT: '#F5EFE3', dark: '#EBE1CC' },
        ink: '#1A1712',
        gold: { DEFAULT: '#C4982A', light: '#E8D5A3' },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      borderRadius: {
        lg: '0.25rem',
        md: '0.125rem',
        sm: '0.0625rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
