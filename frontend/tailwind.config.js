/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { 100: '#E8EDF5', 600: '#18468B', 950: '#0E2A52' },
        orange: { 100: '#FDEAE0', 500: '#EA853C', 600: '#DE6F20' },
        ink: '#0B0D12',
        gray: { 50: '#F7F8FA', 200: '#E4E7EC', 400: '#9AA3B2', 500: '#6B7280' },
        success: '#1E7F53',
        danger: '#D6402C',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px'
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(10,22,40,0.06)',
        'md': '0 4px 12px rgba(10,22,40,0.08)',
        'lg': '0 12px 32px rgba(10,22,40,0.12)',
      }
    },
  },
  plugins: [],
};
