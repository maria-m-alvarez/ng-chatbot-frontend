/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-mode="dark"]'],
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        forFuture: ['"ForFutureSans"', 'sans-serif'],
      },
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

        // to create theme colors, run: node theme-sync update

        // Theme START
          'main-primary': 'var(--main-primary)',
          'main-primary-contrast': 'var(--main-primary-contrast)',
          'main-secondary': 'var(--main-secondary)',
          'main-secondary-contrast': 'var(--main-secondary-contrast)',
          'main-terciary': 'var(--main-terciary)',
          'main-terciary-contrast': 'var(--main-terciary-contrast)',
          'main-highlight': 'var(--main-highlight)',
          'background-primary': 'var(--background-primary)',
          'background-secondary': 'var(--background-secondary)',
          'background-tertiary': 'var(--background-tertiary)',
          'background-highlight': 'var(--background-highlight)',
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-tertiary': 'var(--text-tertiary)',
          'text-highlight': 'var(--text-highlight)',
          'border-primary': 'var(--border-primary)',
          'border-secondary': 'var(--border-secondary)',
          'border-terciary': 'var(--border-terciary)',
          'border-highlight': 'var(--border-highlight)',
          'chatbot-background': 'var(--chatbot-background)',
          'chatbot-bubble-user-background': 'var(--chatbot-bubble-user-background)',
          'chatbot-bubble-user-text': 'var(--chatbot-bubble-user-text)',
          'chatbot-bubble-assistant-background': 'var(--chatbot-bubble-assistant-background)',
          'chatbot-bubble-assistant-text': 'var(--chatbot-bubble-assistant-text)',
          'success': 'var(--success)',
          'success-secondary': 'var(--success-secondary)',
          'error': 'var(--error)',
          'error-secondary': 'var(--error-secondary)',
          'warning': 'var(--warning)',
          'warning-secondary': 'var(--warning-secondary)',
          'info': 'var(--info)',
          'info-secondary': 'var(--info-secondary)',
          'help': 'var(--help)',
          'help-secondary': 'var(--help-secondary)',
          'focus': 'var(--focus)',
          'focus-secondary': 'var(--focus-secondary)',
          'scrollbar-track': 'var(--scrollbar-track)',
          'scrollbar-thumb': 'var(--scrollbar-thumb)',
          'scrollbar-thumb-hover': 'var(--scrollbar-thumb-hover)',
        // Theme END
      },
    },
  },
  plugins: [],
};
