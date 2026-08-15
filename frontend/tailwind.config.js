/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        // New Thema.md standards
        navy: { DEFAULT: '#14131D', soft: '#1F1E2E' },
        accent: { DEFAULT: '#FCA311', soft: '#FFD98F' },
        platinum: { DEFAULT: '#E5E5E5', dark: '#C9C9C9' },
        ink: '#000000',
        success: '#2E7D32',
        warning: '#FCA311',
        danger: '#D32F2F',
        info: '#14131D',

        // Legacy industrial mappings updated to new palette for backwards compatibility
        industrial: {
          primaryBase: '#14131D',     // navy
          primaryAccent: '#FCA311',   // accent
          bgEggshell: '#E5E5E5',      // platinum
          accentChampagne: '#FFD98F', // accent.soft
          accentGreen: '#2E7D32',     // success
          surfaceWhite: '#FFFFFF',    // white
          
          navy: '#14131D',
          blue: '#14131D',        
          orange: '#FCA311',      
          green: '#2E7D32',       
          red: '#D32F2F',         
          amber: '#FCA311',       
          background: '#E5E5E5',  
          border: '#C9C9C9',      
          text: '#000000',        
          muted: '#C9C9C9',       
          surfaceDark: '#14131D', 
          navyDark: '#14131D',      
          navyCard: '#FFFFFF',      
          royalBlue: '#14131D',     
          royalLight: '#E5E5E5',    
          cardOrange: '#FCA311',    
          progressBar: '#2E7D32',   
        },
      },
      boxShadow: {
        'sm-subtle': '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        'soft-card': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'card': '12px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
};
