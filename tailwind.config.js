/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      colors: {
        cosmic: {
          black: '#060610',
          dark: '#0d0d1a',
          darker: '#080814',
          card: '#0f0f20',
        },
        violet: {
          50: '#f5f0ff',
          100: '#ede0ff',
          200: '#d9c0ff',
          300: '#be90ff',
          400: '#a855f7',
          500: '#9333ea', 
          600: '#7c10d0',
          700: '#6b0fa8',
          800: '#5a0e8a',
          900: '#3d0a5e',
          950: '#200638',
          glow: '#b347ff',
          bright: '#c96bff',
        },
        gold: {
          50: '#fffdf0',
          100: '#fff8d6',
          200: '#ffeea3',
          300: '#ffe066',
          400: '#ffd33a',
          500: '#f0b429',
          600: '#d4920e',
          700: '#b8760a',
          800: '#9a600a',
          900: '#7d4d0e',
          glow: '#ffd700',
          bright: '#ffe44d',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow': 'spin 8s linear infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'sword-glow': 'swordGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(179, 71, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(179, 71, 255, 0.7), 0 0 60px rgba(179, 71, 255, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        swordGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px rgba(179, 71, 255, 0.8))' },
          '50%': { filter: 'drop-shadow(0 0 14px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 6px rgba(179, 71, 255, 0.8))' },
        },
      },
      boxShadow: {
        'violet-glow': '0 0 20px rgba(179, 71, 255, 0.4), 0 0 40px rgba(179, 71, 255, 0.2)',
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
