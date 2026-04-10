import { useEffect, useRef } from 'react'
import { ArrowRight, ChevronDown, Play } from 'lucide-react'
import { gsap, SplitText } from '@/lib/gsap'
import { Button } from '@/components/ui/Button'
import BrainSvg from '@/assets/brand/Brain.svg'

interface HeroProps {
  onOpenAuth(): void
  onScrollToDashboard(): void
}

export function Hero({ onOpenAuth, onScrollToDashboard }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctasRef = useRef<HTMLDivElement>(null)
  const brainRef = useRef<HTMLDivElement>(null)
  const scrollIndRef = useRef<HTMLButtonElement>(null)
  const orb1 = useRef<HTMLDivElement>(null)
  const orb2 = useRef<HTMLDivElement>(null)
  const orb3 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      const split = new SplitText(headlineRef.current, { type: 'chars,words' })

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from(eyebrowRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.7,
        delay: 0.2,
      })
        .from(
          split.chars,
          {
            yPercent: 110,
            opacity: 0,
            duration: 1.2,
            stagger: 0.02,
          },
          '-=0.3',
        )
        .from(
          subRef.current,
          { y: 18, opacity: 0, duration: 0.7, ease: 'power3.out' },
          '-=0.6',
        )
        .from(
          ctasRef.current?.children ?? [],
          {
            y: 16,
            opacity: 0,
            scale: 0.94,
            duration: 0.55,
            stagger: 0.09,
            ease: 'back.out(1.4)',
          },
          '-=0.45',
        )
        .from(
          brainRef.current,
          {
            clipPath: 'inset(100% 0% 0% 0%)',
            scale: 0.92,
            opacity: 0,
            duration: 1.8,
          },
          0.3,
        )
        .from(
          scrollIndRef.current,
          { opacity: 0, y: 10, duration: 0.6 },
          '-=0.3',
        )

      // Brain glow pulse
      gsap.to(brainRef.current, {
        filter:
          'drop-shadow(0 0 60px rgba(168,85,247,0.55)) drop-shadow(0 0 120px rgba(236,72,153,0.25))',
        duration: 2.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      // Floating orbs
      ;[orb1, orb2, orb3].forEach((o, i) => {
        gsap.to(o.current, {
          y: `+=${18 + i * 4}`,
          x: `+=${i === 1 ? -12 : 12}`,
          duration: 4 + i,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })

      // Scroll indicator bounce
      gsap.to(scrollIndRef.current, {
        y: 6,
        duration: 1.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden px-6 pt-28 pb-16 md:px-10 lg:px-16"
    >
      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-12 gap-6 lg:gap-10">
        {/* LEFT */}
        <div className="col-span-12 flex flex-col justify-center lg:col-span-7">
          <div
            ref={eyebrowRef}
            className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-xl"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a855f7] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#a855f7]" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              MEMORA · Estudo com IA
            </span>
          </div>

          <h1
            ref={headlineRef}
            className="font-display font-bold leading-[0.92] tracking-[-0.045em] text-[var(--color-text)]"
            style={{ fontSize: 'clamp(48px, 8.2vw, 132px)' }}
          >
            Aprenda mais{' '}
            <span className="gradient-text italic-off">rápido</span>.
          </h1>

          <p
            ref={subRef}
            className="mt-7 max-w-md text-base leading-relaxed text-[var(--color-text-muted)] md:text-[17px]"
          >
            Transforme qualquer conteúdo em flashcards inteligentes em segundos.
            Memorize com ciência, estude no seu ritmo.
          </p>

          <div ref={ctasRef} className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={onOpenAuth}
              rightIcon={<ArrowRight size={18} strokeWidth={1.75} />}
            >
              Começar agora
            </Button>
            <Button
              variant="ghost"
              size="lg"
              leftIcon={<Play size={16} strokeWidth={1.75} />}
            >
              Ver demo
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-xs text-[var(--color-text-dim)]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--color-text)]">
                12k+
              </span>
              <span>estudantes</span>
            </div>
            <div className="h-8 w-px bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--color-text)]">
                420k
              </span>
              <span>cards gerados</span>
            </div>
          </div>
        </div>

        {/* RIGHT — Brain visual */}
        <div className="col-span-12 flex items-center justify-center lg:col-span-5">
          <div className="relative h-[320px] w-[320px] md:h-[420px] md:w-[420px]">
            {/* orbs */}
            <div
              ref={orb1}
              className="absolute -top-6 -right-4 h-24 w-24 rounded-full opacity-70"
              style={{
                background:
                  'radial-gradient(circle, rgba(168,85,247,0.6), transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <div
              ref={orb2}
              className="absolute -bottom-4 -left-8 h-32 w-32 rounded-full opacity-70"
              style={{
                background:
                  'radial-gradient(circle, rgba(236,72,153,0.55), transparent 70%)',
                filter: 'blur(24px)',
              }}
            />
            <div
              ref={orb3}
              className="absolute top-1/3 -right-10 h-20 w-20 rounded-full opacity-60"
              style={{
                background:
                  'radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%)',
                filter: 'blur(18px)',
              }}
            />
            <div
              ref={brainRef}
              className="relative h-full w-full"
              style={{
                filter:
                  'drop-shadow(0 0 40px rgba(168,85,247,0.4)) drop-shadow(0 0 80px rgba(236,72,153,0.15))',
              }}
            >
              <img
                src={BrainSvg}
                alt="MEMORA brain"
                className="h-full w-full select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        ref={scrollIndRef}
        type="button"
        onClick={onScrollToDashboard}
        aria-label="Rolar para o painel"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[var(--color-text-dim)] transition-colors hover:text-[var(--color-text)]"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
          Explorar
        </span>
        <ChevronDown size={18} strokeWidth={1.5} />
      </button>
    </section>
  )
}
