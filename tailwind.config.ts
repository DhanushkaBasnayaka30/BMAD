import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin.js';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'surface-base': '#F8F9FA',
        'surface-raised': '#FFFFFF',
        'surface-sunken': '#EDF0F2',
        'ink-primary': '#0F172A',
        'ink-secondary': '#475569',
        'ink-muted': '#94A3B8',
        'ink-inverse': '#FFFFFF',
        'primary': '#0F2942',
        'primary-hover': '#1B3A5B',
        'primary-subtle': '#EBF2F7',
        'accent-amber': '#D97706',
        'accent-amber-subtle': '#FEF3C7',
        'whatsapp': '#25D366',
        'whatsapp-hover': '#1EBE5D',
        'whatsapp-text': '#075E54',
        'border-subtle': '#E2E8F0',
        'border-strong': '#CBD5E1',
        'status-success': '#15803D',
        'status-success-subtle': '#DCFCE7',
        'status-warning': '#B45309',
        'status-warning-subtle': '#FEF3C7',
        'status-error': '#B91C1C',
        'status-error-subtle': '#FEE2E2',
      },
      fontFamily: {
        base: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', '"Iskoola Pota"', '"Noto Sans Sinhala"', '"Latha"', '"Noto Sans Tamil"', 'sans-serif'],
        'sinhala-fallback': ['"Iskoola Pota"', '"Noto Sans Sinhala"', 'sans-serif'],
        'tamil-fallback': ['"Latha"', '"Noto Sans Tamil"', 'sans-serif'],
        sinhala: ['"Iskoola Pota"', '"Noto Sans Sinhala"', 'sans-serif'],
        tamil: ['"Latha"', '"Noto Sans Tamil"', 'sans-serif'],
      },
      fontSize: {
        display: ['28px', { lineHeight: '1.25', fontWeight: '700' }],
        'heading-1': ['22px', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-2': ['18px', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-3': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-medium': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
        meta: ['14px', { lineHeight: '1.4', fontWeight: '400' }],
        'meta-medium': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        badge: ['12px', { lineHeight: '1.3', fontWeight: '700' }],
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        'touch-target': '44px',
      },
      minHeight: {
        'touch-target': '44px',
      },
      minWidth: {
        'touch-target': '44px',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
      });
    }),
  ],
};

export default config;
