/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          25:  '#f7f8ff',
          50:  '#eef0ff',
          100: '#dde1ff',
          200: '#bbc4ff',
          400: '#7b8cff',
          500: '#4f6ef7',
          600: '#3d5ce8',
          700: '#2e4bd4',
          800: '#1e35b0',
          900: '#101e6e',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          4: 'var(--surface-4)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
          4: 'var(--ink-4)',
          5: 'var(--ink-5)',
        },
        success: { DEFAULT: '#15803d', bg: '#dcfce7' },
        warning: { DEFAULT: '#b45309', bg: '#fef9c3' },
        danger:  { DEFAULT: '#b91c1c', bg: '#fee2e2' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        float: '0 4px 16px 0 rgb(0 0 0 / 0.10)',
        modal: '0 8px 32px 0 rgb(0 0 0 / 0.14)',
        elevated: '0 2px 8px 0 rgb(0 0 0 / 0.06), 0 12px 24px -8px rgb(0 0 0 / 0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-in': 'slideIn 200ms ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
    },
  },
  plugins: [],
}
