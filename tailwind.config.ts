import type { Config } from 'tailwindcss';
import stellarPreset from '@stellar-ui-kit/shared/tailwind-preset';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@stellar-ui-kit/web/dist/**/*.{js,mjs}',
  ],
  presets: [stellarPreset],
  plugins: [typography],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--color-foreground)',
            '--tw-prose-headings': 'var(--color-foreground)',
            '--tw-prose-bold': 'var(--color-foreground)',
            '--tw-prose-links': 'var(--color-primary)',
            '--tw-prose-code': 'var(--color-foreground)',
            '--tw-prose-quotes': 'var(--color-muted)',
            '--tw-prose-quote-borders': 'var(--color-border)',
            '--tw-prose-hr': 'var(--color-border)',
            '--tw-prose-bullets': 'var(--color-muted)',
            '--tw-prose-counters': 'var(--color-muted)',
            'pre': { backgroundColor: 'var(--color-surface)', color: 'var(--color-foreground)' },
            'code': { backgroundColor: 'var(--color-surface)', borderRadius: '0.25rem', padding: '0.125rem 0.25rem' },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            'blockquote': { borderLeftColor: 'var(--color-border)', color: 'var(--color-muted)' },
          },
        },
      },
    },
  },
};

export default config;
