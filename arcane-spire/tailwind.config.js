/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Arcane Spire Fantasy Palette
        arcane: {
          purple: '#8B5CF6',
          'purple-light': '#A78BFA',
          'purple-dark': '#6D28D9',
        },
        fel: {
          green: '#22C55E',
          'green-light': '#4ADE80',
          'green-dark': '#16A34A',
        },
        frost: {
          blue: '#3B82F6',
          'blue-light': '#60A5FA',
          'blue-dark': '#2563EB',
        },
        holy: {
          gold: '#F59E0B',
          'gold-light': '#FBBF24',
          'gold-dark': '#D97706',
        },
        fire: {
          orange: '#EF4444',
          'orange-light': '#F87171',
          'orange-dark': '#DC2626',
        },
        shadow: {
          black: '#1A1A2E',
          darker: '#0F0F1A',
          lighter: '#252542',
        },
        parchment: {
          DEFAULT: '#FEF3C7',
          dark: '#FDE68A',
        },
        stone: {
          DEFAULT: '#6B7280',
          light: '#9CA3AF',
          dark: '#4B5563',
        },
        indigo: {
          deep: '#312E81',
        },
      },
      fontFamily: {
        fantasy: ['fantasy-regular'],
        'fantasy-bold': ['fantasy-bold'],
      },
    },
  },
  plugins: [],
};
