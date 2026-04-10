import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leftIcon, rightSlot, error, ...rest },
  ref,
) {
  return (
    <div className="w-full">
      <div
        className={cn(
          'group flex h-12 w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white/[0.03] px-4 transition-colors focus-within:border-[rgba(168,85,247,0.55)] focus-within:bg-white/[0.06]',
          error && 'border-[rgba(239,68,68,0.6)]',
          className,
        )}
      >
        {leftIcon && (
          <span className="text-[var(--color-text-dim)] group-focus-within:text-[var(--color-primary-400)]">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className="h-full w-full bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none"
          {...rest}
        />
        {rightSlot && (
          <span className="text-[var(--color-text-dim)]">{rightSlot}</span>
        )}
      </div>
      {error && (
        <p
          className="mt-1.5 text-xs text-[#f87171]"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  )
})
