/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b0d11',
          900: '#11141b',
          800: '#181c25',
          700: '#222733',
          600: '#2d3340'
        },
        ember: {
          400: '#f0b45a',
          500: '#e09a2b'
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        panel: '0 18px 50px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: []
};
