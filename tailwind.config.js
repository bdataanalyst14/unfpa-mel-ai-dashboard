/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'sidebar-navy': '#082A4D',
        'primary-blue': '#004B87',
        'accent-orange': '#FF6600',
        'status-green': '#10B981',
        'status-amber': '#F59E0B',
        'status-red': '#EF4444',
        'status-gray': '#9CA3AF',
        'canvas-bg': '#F9FAFB',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
};
