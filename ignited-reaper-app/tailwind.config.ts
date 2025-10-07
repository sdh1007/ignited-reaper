import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        abyss: {
          50: '#f4f6fb',
          100: '#dfe3ef',
          200: '#c8cce0',
          300: '#9ea4c3',
          400: '#71779e',
          500: '#4a5277',
          600: '#31385c',
          700: '#252b4a',
          800: '#1a1a2e',
          900: '#121524',
          950: '#090b16',
        },
        dusk: {
          50: '#f4f6ff',
          100: '#dfe5ff',
          200: '#bcc9ff',
          300: '#8fa3ff',
          400: '#647aff',
          500: '#4457f0',
          600: '#2f3dc6',
          700: '#27329a',
          800: '#20286f',
          900: '#1c2255',
          950: '#131538',
        },
        silver: {
          50: '#f7f7f8',
          100: '#ececed',
          200: '#e0e0e0',
          300: '#d0d1d4',
          400: '#c5c6c7',
          500: '#aeb0b3',
          600: '#8f9196',
          700: '#6e7077',
          800: '#4c4e55',
          900: '#2c2e35',
          950: '#191a20',
        },
        ember: {
          50: '#fff1f3',
          100: '#ffe0e5',
          200: '#ffc0c9',
          300: '#ff9aa7',
          400: '#ff6b6b',
          500: '#ee5a6f',
          600: '#d03e58',
          700: '#ab2d46',
          800: '#872438',
          900: '#661a2b',
          950: '#3a0d17',
        },
      },
      fontFamily: {
        gothic: ['Creepster', 'serif'],
        clean: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'ember-glow': '0 0 28px rgba(238, 90, 111, 0.45)',
        'moon-mist': '0 30px 60px rgba(18, 21, 36, 0.55)',
      },
      transitionTimingFunction: {
        grave: 'cubic-bezier(0.6, 0.04, 0.3, 1)',
      },
      animation: {
        'lantern-drift': 'lantern-drift 8s ease-in-out infinite',
        'ember-pulse': 'ember-pulse 3s ease-in-out infinite',
        'spectral-fade': 'spectral-fade 1.6s ease-in-out infinite',
      },
      keyframes: {
        'lantern-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(0.15rem, -0.4rem, 0) scale(1.04)' },
        },
        'ember-pulse': {
          '0%': { boxShadow: '0 0 10px rgba(238, 90, 111, 0.2)', opacity: '0.85' },
          '50%': { boxShadow: '0 0 26px rgba(238, 90, 111, 0.55)', opacity: '1' },
          '100%': { boxShadow: '0 0 10px rgba(238, 90, 111, 0.2)', opacity: '0.85' },
        },
        'spectral-fade': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '0.85' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
