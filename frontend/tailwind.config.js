/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Aeonik"', '"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"SendHapy"', '"Fredoka"', 'sans-serif'],
      },
      colors: {
        industrial: {
          primaryBase: '#032A53',     // OxfordBlue
          primaryAccent: '#E43B00',   // Sinopia
          bgEggshell: '#F4F1DE',      // Eggshell
          accentChampagne: '#F2CC8F', // Deep Champagne
          accentGreen: '#81B29A',     // Green Sheen
          surfaceWhite: '#FFFFFF',    // White
          
          // Legacy mappings mapped to new colors so existing components don't break entirely
          navy: '#032A53',
          blue: '#E43B00',        
          orange: '#F2CC8F',      
          green: '#81B29A',       
          red: '#E43B00',         
          amber: '#F2CC8F',       
          background: '#F4F1DE',  
          border: '#E2E8F0',      
          text: '#032A53',        
          muted: '#64748B',       
          surfaceDark: '#032A53', 
          navyDark: '#032A53',      
          navyCard: '#FFFFFF',      
          royalBlue: '#E43B00',     
          royalLight: '#F2CC8F',    
          cardOrange: '#E43B00',    
          progressBar: '#81B29A',   
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
