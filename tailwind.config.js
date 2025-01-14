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
          'header': 'var(--header)',
          'header-contrast': 'var(--header-contrast)',
          'background': 'var(--background)',
          'background-contrast': 'var(--background-contrast)',
          'primary': 'var(--primary)',
          'primary-hover': 'var(--primary-hover)',
          'primary-contrast': 'var(--primary-contrast)',
          'secondary': 'var(--secondary)',
          'secondary-hover': 'var(--secondary-hover)',
          'secondary-contrast': 'var(--secondary-contrast)',
          'tertiary': 'var(--tertiary)',
          'tertiary-hover': 'var(--tertiary-hover)',
          'tertiary-contrast': 'var(--tertiary-contrast)',
          'accent': 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          'accent-contrast': 'var(--accent-contrast)',
          'links-primary': 'var(--links-primary)',
          'links-primary-hover': 'var(--links-primary-hover)',
          'links-secondary': 'var(--links-secondary)',
          'links-secondary-hover': 'var(--links-secondary-hover)',
          'links-accent': 'var(--links-accent)',
          'links-accent-hover': 'var(--links-accent-hover)',
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
        
    themes: {
      light: '[data-theme="light"]',
      dark: '[data-theme="dark"]'
    },// Theme END
      },
    },
  },
  plugins: [],
};
