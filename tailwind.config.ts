import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'hsl(var(--border))',
        'formula-one-primary': 'var(--formula-one-primary)',
        'mercedes-primary': 'var(--mercedes-primary)',
        'rbr-primary': 'var(--rbr-primary)',
        'ferrari-primary': 'var(--ferrari-primary)',
        'mclaren-primary': 'var(--mclaren-primary)',
        'alpine-primary': 'var(--alpine-primary)',
        'vcrb-primary': 'var(--vcrb-primary)',
        'am-primary': 'var(--am-primary)',
        'williams-primary': 'var(--williams-primary)',
        'sauber-primary': 'var(--sauber-primary)',
        'haas-primary': 'var(--haas-primary)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config