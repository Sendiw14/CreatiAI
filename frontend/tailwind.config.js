/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: '#9333EA',
        cyan: '#0891B2',
        gold: '#D97706',
        'bg-page': '#030303',
        'bg-surface': '#0A0A0A',
        'bg-elevated': '#121212',
        'bg-card': '#0A0A0A',
        'bg-panel': '#0F0F11',
        'bg-input': '#18181B',
        'bg-hover': '#27272A',
        'text-primary': '#FAFAFA',
        'text-secondary': '#A1A1AA',
        'text-muted': '#71717A',
        'text-disabled': '#3F3F46',
        'conf-high': '#D97706',
        'conf-medium': '#0891B2',
        'conf-low': '#EF4444',
        'conf-speculative': '#9333EA',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #9333EA 0%, #0891B2 55%, #D97706 100%)',
        'gradient-subtle': 'linear-gradient(135deg, rgba(147,51,234,0.1), rgba(8,145,178,0.1), rgba(217,119,6,0.1))',
        'gradient-text': 'linear-gradient(90deg, #9333EA, #0891B2, #D97706)',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
        'ticker': 'ticker 30s linear infinite',
        'breathing': 'breathing 2s ease-in-out infinite',
        'blob-drift': 'blob-drift 20s ease-in-out infinite alternate',
        'whiif-pulse': 'whiif-pulse 2s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '100%': { transform: 'translateY(-30px) translateX(20px) rotate(5deg)' },
        },
        shimmer: {
          'from': { backgroundPosition: '-200% 0' },
          'to': { backgroundPosition: '200% 0' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        breathing: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'blob-drift': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '100%': { transform: 'translate(40px, -30px) scale(1.1)' },
        },
        'whiif-pulse': {
          '0%, 100%': { borderColor: 'rgba(217,119,6,0.4)' },
          '50%': { borderColor: 'rgba(217,119,6,0.9)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(147,51,234,0.3)',
        'glow-cyan': '0 0 20px rgba(8,145,178,0.3)',
        'glow-gold': '0 0 20px rgba(217,119,6,0.3)',
        'node-selected': '0 0 0 2px #9333EA, 0 0 20px rgba(147,51,234,0.3)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.4)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out-custom': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
