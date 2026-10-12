/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#126044',
          deep: '#0C503A',
          hover: '#0e4e37',
          light: '#197a57',
        },
        lime: {
          DEFAULT: '#C7FF35',
          dark: '#a8db20',
          light: '#d5ff5e',
        },
        sage: {
          DEFAULT: '#F4F7EF',
          light: '#FAFCF7',
          muted: '#E8EFE2',
        },
        card: '#FFFFFF',
        text: {
          primary: '#15291F',
          secondary: '#718176',
          muted: '#8C9B90',
        },
        border: {
          DEFAULT: '#E2EADF',
          dark: '#CDD9C9',
        },
        state: {
          success: '#24834F',
          warning: '#E6A323',
          error: '#D94848',
          info: '#2D72D2',
        }
      },
      width: {
        sidebar: '235px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        card: '0 2px 6px -1px rgba(21, 41, 31, 0.06), 0 2px 4px -2px rgba(21, 41, 31, 0.04)',
        elevated: '0 10px 25px -5px rgba(18, 96, 68, 0.1), 0 8px 10px -6px rgba(18, 96, 68, 0.05)',
      }
    },
  },
  plugins: [],
}
