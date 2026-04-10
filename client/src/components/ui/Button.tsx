import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'ghost' | 'icon' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const base =
  'relative inline-flex items-center justify-center gap-2 font-medium transition-transform duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] whitespace-nowrap select-none'

const sizeMap: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-full',
  md: 'h-11 px-5 text-sm rounded-full',
  lg: 'h-14 px-7 text-base rounded-full',
}

const variantMap: Record<Variant, string> = {
  primary:
    'text-white shadow-[0_10px_40px_-10px_rgba(168,85,247,0.6)] bg-[linear-gradient(135deg,#a855f7_0%,#6366f1_55%,#ec4899_100%)] hover:shadow-[0_16px_50px_-10px_rgba(168,85,247,0.8)] hover:-translate-y-0.5',
  ghost:
    'text-[var(--color-text)] bg-white/5 border border-[var(--color-border)] backdrop-blur-xl hover:bg-white/10 hover:-translate-y-0.5',
  outline:
    'text-[var(--color-text)] border border-[var(--color-border-strong)] hover:border-[rgba(168,85,247,0.6)] hover:text-[var(--color-primary-400)]',
  icon: 'h-10 w-10 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-white/5 border border-[var(--color-border)] hover:bg-white/10',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = 'primary', size = 'md', leftIcon, rightIcon, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          base,
          variant !== 'icon' && sizeMap[size],
          variantMap[variant],
          className,
        )}
        {...rest}
      >
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  },
)
