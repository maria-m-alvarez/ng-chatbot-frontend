/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '32': '32px',
      },
      colors: {
        // Minsait Main Colors
        'minsait-pruno': '#480E2A',         // Primary
        'minsait-pruno-dark': '#260717',    // Highlight
        'minsait-gris': '#E3E2DA',          // Secondary
        'minsait-white': '#FFFFFF',         // White
        'minsait-fucsia': '#FF0054',        // Highlight Secondary

        // Minsait Complementary Colors
        'minsait-sucess': '#44B757',
        'minsait-sucess-secondary': '#A9E8A7',

        'minsait-error': '#D2044A',
        'minsait-error-secondary': '#F4A6C4',

        'minsait-warning': '#E56813',
        'minsait-warning-secondary': '#FFA96E',

        'minsait-info': '#8661F5',
        'minsait-info-secondary': '#C0B3F8',


        // Main Colors
        'main-primary': 'var(--color-main-primary)',
        'main-primary-contrast': 'var(--color-main-primary-contrast)',
        'main-secondary': 'var(--color-main-secondary)',
        'main-secondary-contrast': 'var(--color-main-secondary-contrast)',
        'main-terciary': 'var(--color-main-terciary)',
        'main-terciary-contrast': 'var(--color-main-terciary-contrast)',
        'main-highlight': 'var(--color-main-highlight)',

        // Background Colors
        'background-primary': 'var(--color-background-primary)',
        'background-secondary': 'var(--color-background-secondary)',
        'background-tertiary': 'var(--color-background-tertiary)',
        'background-highlight': 'var(--color-background-highlight)',

        // Text Colors
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-highlight': 'var(--color-text-highlight)',

        // Border Colors
        'border-primary': 'var(--color-border-primary)',
        'border-secondary': 'var(--color-border-secondary)',
        'border-terciary': 'var(--color-border-terciary)',
        'border-highlight': 'var(--color-border-highlight)',

        // Chatbot Colors
        'chatbot-background': 'var(--color-chatbot-background)',
        'chatbot-bubble-user-background': 'var(--color-chatbot-bubble-user-background)',
        'chatbot-bubble-user-text': 'var(--color-chatbot-bubble-user-text)',
        'chatbot-bubble-assistant-background': 'var(--color-chatbot-bubble-assistant-background)',
        'chatbot-bubble-assistant-text': 'var(--color-chatbot-bubble-assistant-text)',

        // Status Colors
        'success': 'var(--color-success)',
        'success-secondary': 'var(--color-success-secondary)',
        
        'error': 'var(--color-error)',
        'error-secondary': 'var(--color-error-secondary)',

        'warning': 'var(--color-warning)',
        'warning-secondary': 'var(--color-warning-secondary)',

        'info': 'var(--color-info)',
        'info-secondary': 'var(--color-info-secondary)',

        'help': 'var(--color-help)',
        'help-secondary': 'var(--color-help-secondary)',

        'focus': 'var(--color-focus)',
        'focus-secondary': 'var(--color-focus-secondary)',

        // Scrollbar Colors
        'scrollbar-track': 'var(--scrollbar-track)',
        'scrollbar-thumb': 'var(--scrollbar-thumb)',
        'scrollbar-thumb-hover': 'var(--scrollbar-thumb-hover)',
      },
    },
  },
  plugins: [],
};
