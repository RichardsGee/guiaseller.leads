/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Marketplace colors
        marketplace: {
          ml: '#FFE600',       // Mercado Livre
          shopee: '#EE4D2D',   // Shopee
          magalu: '#0086FF',   // Magazine Luiza
          tiktok: '#000000',   // TikTok
          amazon: '#FF9900',   // Amazon
          shein: '#000000',    // Shein
        },
        // Semantic
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0f172a',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          dark: '#1e293b',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
