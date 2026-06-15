'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

/**
 * Drop-in replacement for `<Input type="password" />` that adds a show/hide
 * toggle. Forwards every other prop through to the underlying `Input`.
 *
 * Accessibility:
 *  - The eye button is treated as a *secondary* control (tabIndex=-1) so it
 *    doesn't disrupt the normal tab order between the field and the submit
 *    button. Keyboard users can still toggle visibility by tabbing in via
 *    explicit focus, or by clicking the icon.
 *  - aria-label flips between "Show password" / "Hide password".
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    /** Override the default labels (useful for non-shared i18n setups). */
    showLabel?: string;
    hideLabel?: string;
  }
>(({ className, showLabel = 'Show password', hideLabel = 'Hide password', ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={cn('pe-10', className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? hideLabel : showLabel}
        title={visible ? hideLabel : showLabel}
        className="absolute end-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';
