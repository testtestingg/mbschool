/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e83bb',
        'primary-light': '#3F7FC8',
        'primary-dark': '#166ca0',
        'muted-foreground': '#6b7280',
        border: '#e5e7eb',
        muted: '#f9fafb',
        yellow: {
          100: '#fff8e1'
        }
      }
    },
  },
  plugins: [],
};
