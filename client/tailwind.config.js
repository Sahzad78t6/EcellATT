/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          0: '#02040a',
          1: '#060b16',
        },
        surface: {
          1: '#0a1224',
          2: '#0e1a33',
          3: '#13223f',
        },
        brand: {
          primary: '#2563eb',
          bright: '#3b82f6',
          glow: '#60a5fa',
          ice: '#93c5fd',
          cyan: '#22d3ee',
          deep: '#1e3a8a',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        border: {
          subtle: 'rgba(96, 165, 250, 0.14)',
          bright: 'rgba(96, 165, 250, 0.28)',
          glow: 'rgba(59, 130, 246, 0.5)',
        },
        status: {
          present: '#10b981',
          absent: '#ef4444',
          atrisk: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'modal': '20px',
        'pill': '9999px',
      },
      boxShadow: {
        'depth-1': '0 2px 8px -2px rgba(0, 0, 0, 0.6), 0 1px 2px -1px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'depth-2': '0 8px 24px -4px rgba(0, 0, 0, 0.7), 0 2px 6px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'depth-3': '0 20px 48px -8px rgba(0, 0, 0, 0.85), 0 6px 16px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'glow-blue': '0 0 24px -4px rgba(59, 130, 246, 0.35)',
        'glow-cyan': '0 0 24px -4px rgba(34, 211, 238, 0.35)',
        'btn-3d': '0 4px 14px -2px rgba(37, 99, 235, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        'btn-3d-active': '0 1px 4px -1px rgba(37, 99, 235, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-reverse': 'floatReverse 10s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(15px, -20px, 0) rotate(2deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(-15px, 20px, 0) rotate(-2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.08)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      }
    },
  },
  plugins: [],
}
