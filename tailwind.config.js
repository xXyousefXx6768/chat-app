/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens:{
        'sm': '200px'
      } ,
      backgroundImage: {
        'hero-pattern': "url('./src/assets/wallapaper.jpeg')",
         'dark': "url('./src/assets/darkmode.jpg')"
        
      },
      

    }
    
    ,
  },
  plugins: [],
  darkMode:'class'
}

