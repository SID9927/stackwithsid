/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Purple/Almond-Black palette
        brand: {
          50:  'hsl(270, 100%, 97%)',
          100: 'hsl(270, 95%,  92%)',
          200: 'hsl(270, 90%,  83%)',
          300: 'hsl(270, 85%,  72%)',
          400: 'hsl(270, 80%,  62%)',
          500: 'hsl(270, 75%,  55%)', // Primary purple
          600: 'hsl(270, 70%,  46%)',
          700: 'hsl(270, 65%,  38%)',
          800: 'hsl(270, 60%,  28%)',
          900: 'hsl(270, 55%,  18%)',
        },
        // Night mode deep backgrounds
        dark: {
          50:  'hsl(255, 15%, 96%)',
          100: 'hsl(255, 14%, 10%)',
          200: 'hsl(255, 14%, 8%)',
          300: 'hsl(255, 15%, 6%)',   // Main bg
          400: 'hsl(255, 16%, 4%)',   // Deepest bg
          500: 'hsl(255, 10%, 14%)',  // Card bg
          600: 'hsl(255, 10%, 18%)',  // Elevated card
        },
        // Day mode warm almond
        light: {
          50:  'hsl(38, 40%, 98%)',   // Almond white bg
          100: 'hsl(38, 35%, 95%)',
          200: 'hsl(38, 30%, 90%)',
          300: 'hsl(38, 25%, 82%)',
          400: 'hsl(38, 20%, 70%)',
        },
        // Accent colors
        violet: {
          glow: 'hsl(270, 100%, 70%)',
          soft: 'hsl(270, 60%,  70%)',
          dim:  'hsl(270, 40%,  40%)',
        },
        // Purple gradient stops
        purple: {
          neon: '#a855f7',
          soft: '#c084fc',
          mid:  '#9333ea',
          deep: '#6b21a8',
        },
      },
      fontFamily: {
        syne:    ['var(--font-syne)',    'sans-serif'],
        dm:      ['var(--font-dm)',      'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-dark':  'radial-gradient(ellipse 80% 60% at 50% -10%, hsl(270,80%,20%) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, hsl(270,70%,15%) 0%, transparent 60%)',
        'mesh-light': 'radial-gradient(ellipse 80% 60% at 50% -10%, hsl(270,80%,90%) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, hsl(38,60%,92%) 0%, transparent 60%)',
      },
      animation: {
        'float':         'float 6s ease-in-out infinite',
        'float-slow':    'float 9s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 1.5s infinite',
        'pulse-glow':    'pulseGlow 3s ease-in-out infinite',
        'spin-slow':     'spin 20s linear infinite',
        'reveal-up':     'revealUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'balloon-in':    'balloonIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'balloon-out':   'balloonOut 0.4s cubic-bezier(0.55, 0, 1, 0.45) forwards',
        'shimmer':       'shimmer 2.5s infinite',
        'border-spin':   'borderSpin 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-20px) rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 20px hsl(270,80%,55%), 0 0 40px hsl(270,80%,35%)' },
          '50%':      { opacity: '1',   boxShadow: '0 0 40px hsl(270,80%,65%), 0 0 80px hsl(270,80%,45%)' },
        },
        revealUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        balloonIn: {
          from: { opacity: '0', transform: 'scale(0.4) translateY(20px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        balloonOut: {
          from: { opacity: '1', transform: 'scale(1) translateY(0)' },
          to:   { opacity: '0', transform: 'scale(0.4) translateY(-20px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        borderSpin: {
          '0%':   { '--angle': '0deg' },
          '100%': { '--angle': '360deg' },
        },
      },
      boxShadow: {
        'glow-sm':  '0 0 12px hsl(270,80%,55%,0.4)',
        'glow-md':  '0 0 24px hsl(270,80%,55%,0.5)',
        'glow-lg':  '0 0 48px hsl(270,80%,55%,0.4), 0 0 96px hsl(270,80%,55%,0.2)',
        'card-dark':'0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'card-light':'0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
