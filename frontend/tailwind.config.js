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
          blue: '#00A3AD',        // Primary Accent Teal
          orange: '#F36F21',      // Secondary Accent Orange
          green: '#10B981',       // Semantic Success
          red: '#E53E3E',         // Semantic Danger
          amber: '#F59E0B',       // Semantic Warning
          background: '#F4F7FB',  // App Background
          border: '#E2E8F0',      // Border
          text: '#1A202C',        // Text Primary
          muted: '#718096',       // Text Secondary
          surfaceDark: '#0B1E2E', // Surface Dark
          // === Reference design color tokens ===
          navyDark: '#00305B',      // Sidebar & SEMUA PM scorecard
          navyCard: '#0B1E2E',      // SEMUA PM card header
          royalBlue: '#00A3AD',     // PM04 card header
          royalLight: '#00C3CF',    // PM04 progress bar (Lighter teal)
          cardOrange: '#F36F21',    // PM02+ card header
          progressBar: '#00A3AD',   // Table progress bar fill
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
