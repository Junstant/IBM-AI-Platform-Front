/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 IBM Carbon Design System - Paleta Oficial
        'carbon': {
          // Grays (UI Backgrounds & Text)
          'gray': {
            10: '#f4f4f4',   // Lightest UI background
            20: '#e0e0e0',   // Dividers, borders
            30: '#c6c6c6',   // Disabled state
            40: '#a8a8a8',   // Placeholder text
            50: '#8d8d8d',   // Secondary text
            60: '#6f6f6f',   // Tertiary text
            70: '#525252',   // Primary text (light mode)
            80: '#393939',   // Dark UI elements
            90: '#262626',   // Header, top nav
            100: '#161616',  // Darkest text
          },
          // Blues (Primary Actions)
          'blue': {
            10: '#edf5ff',
            20: '#d0e2ff',
            30: '#a6c8ff',
            40: '#78a9ff',
            50: '#4589ff',
            60: '#0f62fe',   // Primary button IBM
            70: '#0043ce',
            80: '#002d9c',
            90: '#001d6c',
            100: '#001141',
          },
          // Status colors
          'red': {
            50: '#ff8389',
            60: '#da1e28',   // Error state
            70: '#a2191f',
          },
          'green': {
            50: '#6fdc8c',
            60: '#24a148',   // Success state
            70: '#198038',
          },
          'yellow': {
            30: '#f1c21b',   // Warning state
          },
          'white': '#ffffff',
          'black': '#000000',
        },
        // Shortcuts para componentes
        'ui-background': '#ffffff',
        'ui-01': '#f4f4f4',         // Layer background
        'ui-02': '#ffffff',         // Card/panel background
        'ui-03': '#e0e0e0',         // Border/divider
        'ui-04': '#8d8d8d',         // Secondary border
        'ui-05': '#161616',         // Darkest UI
        'text-primary': '#161616',   // Main text
        'text-secondary': '#525252', // Secondary text
        'text-placeholder': '#a8a8a8',
        'text-on-color': '#ffffff',
        'link-primary': '#0f62fe',   // Links
        'link-secondary': '#0043ce',
        'interactive': '#0f62fe',    // Interactive elements
        'danger': '#da1e28',
        'success': '#24a148',
        'warning': '#f1c21b',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        'caption': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.32px' }],      // 12px
        'label': ['0.875rem', { lineHeight: '1.125rem', letterSpacing: '0.16px' }],   // 14px
        'body-short': ['0.875rem', { lineHeight: '1.125rem', letterSpacing: '0.16px' }], // 14px
        'body-long': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.16px' }],   // 14px
        'heading': ['1rem', { lineHeight: '1.375rem', letterSpacing: '0' }],          // 16px
        'productive-heading-01': ['0.875rem', { lineHeight: '1.125rem', letterSpacing: '0.16px' }], // 14px
        'productive-heading-02': ['1rem', { lineHeight: '1.375rem', letterSpacing: '0' }],         // 16px
        'productive-heading-03': ['1.25rem', { lineHeight: '1.625rem', letterSpacing: '0' }],      // 20px
        'productive-heading-04': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '0' }],       // 28px
      },
      spacing: {
        // IBM Carbon Spacing Scale
        '01': '0.125rem',  // 2px
        '02': '0.25rem',   // 4px
        '03': '0.5rem',    // 8px
        '04': '0.75rem',   // 12px
        '05': '1rem',      // 16px
        '06': '1.5rem',    // 24px
        '07': '2rem',      // 32px
        '08': '2.5rem',    // 40px
        '09': '3rem',      // 48px
        '10': '4rem',      // 64px
        '11': '5rem',      // 80px
        '12': '6rem',      // 96px
        '13': '10rem',     // 160px
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',       // IBM usa muy poco radius
        'DEFAULT': '4px',  // Radius por defecto
      },
      boxShadow: {
        // Sombras muy sutiles tipo IBM
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 2px 6px 0 rgba(0, 0, 0, 0.1)',
        'md': '0 4px 8px 0 rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
        'none': 'none',
      },
      transitionDuration: {
        'fast': '110ms',       // Fast motion
        'moderate': '150ms',   // Moderate motion
        'slow': '240ms',       // Slow motion
        'slower': '400ms',     // Slower motion
      },
    },
  },
  plugins: [],
}
