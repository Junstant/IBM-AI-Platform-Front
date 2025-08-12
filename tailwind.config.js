/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ibm': {
          blue: {
            10: '#f1f5ff',
            20: '#d9e6ff',
            30: '#b3ccff',
            40: '#7aa3ff',
            50: '#4285f4',
            60: '#0060ff',
            70: '#0043ce',
            80: '#002d9c',
            90: '#001d6c',
            100: '#001141',
          },
          gray: {
            10: '#f4f4f4',
            20: '#e0e0e0',
            30: '#c6c6c6',
            40: '#a8a8a8',
            50: '#8d8d8d',
            60: '#6f6f6f',
            70: '#525252',
            80: '#393939',
            90: '#262626',
            100: '#161616',
          },
          white: '#ffffff',
          black: '#000000',
          red: '#da1e28',
          orange: '#ff832b',
          yellow: '#f1c21b',
          green: '#24a148',
          teal: '#009d9a',
          cyan: '#1192e8',
          purple: '#8a3ffc',
          magenta: '#d12771',
        },
        // Colores principales de IBM
        'primary': '#0060ff',
        'secondary': '#525252',
        'success': '#24a148',
        'warning': '#f1c21b',
        'danger': '#da1e28',
        'info': '#1192e8',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-ibm': 'linear-gradient(135deg, #0060ff 0%, #1192e8 100%)',
        'gradient-ibm-dark': 'linear-gradient(135deg, #002d9c 0%, #0043ce 100%)',
      }
    },
  },
  plugins: [],
}
