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
          navy: '#0F172A',
          blue: '#2563EB',
          orange: '#FF5722',
          green: '#10B981',
          red: '#EF4444',
          amber: '#F59E0B',
          background: '#F0F3F8',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#64748B',
          // === Reference design color tokens ===
          navyDark: '#0F2052',      // Sidebar & SEMUA PM scorecard
          navyCard: '#13254F',      // SEMUA PM card header
          royalBlue: '#1A4BC4',     // PM04 card header
          royalLight: '#2A5FD4',    // PM04 progress bar
          cardOrange: '#D9650F',    // PM02+ card header
          progressBar: '#1E56D9',   // Table progress bar fill
        },
      },
      boxShadow: {
        'sm-subtle': '0 2px 8px 0 rgba(0, 0, 0, 0.03)',
        'soft-card': '0 8px 24px -4px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        'card': '24px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
};
