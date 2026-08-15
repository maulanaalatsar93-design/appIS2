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
      },
      colors: {
        industrial: {
          navy: '#00305B',        // Primary Navy
          blue: '#1268B3',        // Primary Accent Blue
          orange: '#F47920',      // Secondary Accent Orange
          green: '#16A34A',       // Semantic Success
          red: '#E53E3E',         // Semantic Danger
          amber: '#F59E0B',       // Semantic Warning
          background: '#F5F7FB',  // App Background
          border: '#E2E8F0',      // Border
          text: '#1A202C',        // Text Primary
          muted: '#718096',       // Text Secondary
          surfaceDark: '#0D1E2D', // Surface Dark
          // === Reference design color tokens ===
          navyDark: '#00305B',      // Sidebar & SEMUA PM scorecard
          navyCard: '#0D1E2D',      // SEMUA PM card header
          royalBlue: '#1268B3',     // PM04 card header
          royalLight: '#1268B3',    // PM04 progress bar (Lighter teal)
          cardOrange: '#F47920',    // PM02+ card header
          progressBar: '#1268B3',   // Table progress bar fill
        },
      },
      boxShadow: {
        'sm-subtle': '0 2px 8px 0 rgba(0, 48, 91, 0.03)',
        'soft-card': '0 4px 16px 0 rgba(0, 48, 91, 0.04)',
      },
      borderRadius: {
        'card': '18px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
};
