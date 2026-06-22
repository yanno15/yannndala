/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#080810',
        surface: '#0f0f1a',
        panel: '#13131f',
        border: '#1e1e30',
        // Palette orange principale — remplace le violet
        brand: {
          400: '#d4622e',   // orange clair (anciennement violet-400)
          500: '#9B4922',   // orange base  (anciennement violet-500)
          600: '#7a3318',   // orange foncé (anciennement violet-600)
          700: '#5c2510',   // orange très foncé
        },
        // Garde "violet" comme alias pour ne pas casser les classes existantes
        violet: {
          400: '#d4622e',
          500: '#9B4922',
          600: '#7a3318',
          700: '#5c2510',
        },
        neon: {
          purple: '#e8722e',   // remplacé par orange vif
          cyan: '#f59c5a',     // remplacé par orange doux
          pink: '#c0391a',     // remplacé par rouge-orangé
        },
        muted: '#6b7280',
        subtle: '#9ca3af',
        light: '#e5e7eb',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'typing': 'typing 3s steps(40) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(155,73,34,0.3)' },
          '50%': { boxShadow: '0 0 50px rgba(155,73,34,0.8), 0 0 100px rgba(212,98,46,0.3)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        typing: {
          '0%, 100%': { width: '0' },
          '30%, 70%': { width: '100%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
