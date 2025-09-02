import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        gray: {
          1000: 'hsl(var(--gray-1000))',
          950: 'hsl(var(--gray-950))',
          900: 'hsl(var(--gray-900))',
          850: 'hsl(var(--gray-850))',
          800: 'hsl(var(--gray-800))',
          700: 'hsl(var(--gray-700))',
          600: 'hsl(var(--gray-600))',
          500: 'hsl(var(--gray-500))',
          400: 'hsl(var(--gray-400))',
          300: 'hsl(var(--gray-300))',
          200: 'hsl(var(--gray-200))',
          100: 'hsl(var(--gray-100))',
          50: 'hsl(var(--gray-50))',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config