/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        navy: { DEFAULT: '#14131D', soft: '#1F1E2E' },
        accent: { DEFAULT: '#FCA311', soft: '#FFD98F' },
        platinum: { DEFAULT: '#E5E5E5', dark: '#C9C9C9' },
        ink: '#000000',
        success: '#2E7D32',
        warning: '#FCA311',
        danger: '#D32F2F',
        info: '#14131D',
      },
      boxShadow: {
        'sm-subtle': '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        'soft-card': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'card': '14px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
};
