import { useEffect, useRef, type RefObject } from 'react'
import { gsap } from '@/lib/gsap'

/**
 * Scope GSAP animations to a container ref. All animations created inside the
 * callback are reverted on unmount, preventing memory leaks and duplicate
 * timelines under React StrictMode.
 */
export function useGsapContext<T extends HTMLElement>(
  setup: (ctx: gsap.Context) => void,
  deps: ReadonlyArray<unknown> = [],
): RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(setup, ref.current)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
