import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface Options {
  to: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
}

/** Animates a number counter when the element scrolls into view. */
export function useCountUp<T extends HTMLElement>(options: Options) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obj = { val: 0 }
    const fmt = (v: number) =>
      `${options.prefix ?? ''}${v.toFixed(options.decimals ?? 0)}${
        options.suffix ?? ''
      }`
    el.textContent = fmt(0)

    const tween = gsap.to(obj, {
      val: options.to,
      duration: options.duration ?? 1.6,
      ease: 'power1.out',
      snap: options.decimals ? undefined : { val: 1 },
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = fmt(obj.val)
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [options.to, options.duration, options.decimals, options.prefix, options.suffix])

  // ensure ScrollTrigger is referenced so tree-shaking keeps it
  void ScrollTrigger

  return ref
}
