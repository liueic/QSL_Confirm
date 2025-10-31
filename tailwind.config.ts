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
        // 🎨 Flat Fall Guys Color Palette
        'candy-pink': 'var(--candy-pink)',
        'candy-purple': 'var(--candy-purple)',
        'candy-blue': 'var(--candy-blue)',
        'candy-cyan': 'var(--candy-cyan)',
        'candy-yellow': 'var(--candy-yellow)',
        'candy-orange': 'var(--candy-orange)',
        'candy-mint': 'var(--candy-mint)',
        'candy-peach': 'var(--candy-peach)',
        
        // System colors
        'primary': 'var(--color-primary)',
        'accent': 'var(--color-accent)',
        'secondary': 'var(--color-secondary)',
        'surface': 'var(--color-surface)',
      },
      backgroundColor: {
        'primary': 'var(--color-bg)',
      },
      textColor: {
        'primary': 'var(--color-text)',
        'secondary': 'var(--color-text-secondary)',
      },
      borderColor: {
        'default': 'var(--color-border)',
        'primary': 'var(--color-primary)',
        'accent': 'var(--color-accent)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['var(--font-pixel-sans)', 'Baloo 2', 'system-ui', 'sans-serif'],
        mono: ['var(--font-pixel-mono)', 'monospace'],
      },
      animation: {
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'bounce-rainbow': 'bounce-rainbow 1.5s ease-in-out infinite',
        'candy-pulse': 'candy-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
