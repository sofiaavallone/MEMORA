import type { ChangeEvent } from 'react'

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange(value: number): void
  label?: string
}

export function Slider({ value, min, max, step = 1, onChange, label }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-wider text-[var(--color-text-dim)]">
            {label}
          </span>
          <span className="font-mono text-sm tabular-nums text-[var(--color-text)]">
            {value}
          </span>
        </div>
      )}
      <div className="relative h-1.5 w-full rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#a855f7,#6366f1,#ec4899)]"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(Number(e.target.value))
          }
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#a855f7] [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(168,85,247,0.25)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#a855f7]"
        />
      </div>
    </div>
  )
}
