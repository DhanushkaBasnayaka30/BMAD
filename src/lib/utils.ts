import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'surface-base',
        'surface-raised',
        'surface-sunken',
        'ink-primary',
        'ink-secondary',
        'ink-muted',
        'ink-inverse',
        'primary',
        'primary-hover',
        'primary-subtle',
        'accent-amber',
        'accent-amber-subtle',
        'whatsapp',
        'whatsapp-hover',
        'whatsapp-text',
        'border-subtle',
        'border-strong',
        'status-success',
        'status-success-subtle',
        'status-warning',
        'status-warning-subtle',
        'status-error',
        'status-error-subtle',
      ],
    },
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'heading-1',
            'heading-2',
            'heading-3',
            'body',
            'body-medium',
            'meta',
            'meta-medium',
            'badge',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return customTwMerge(clsx(inputs));
}
