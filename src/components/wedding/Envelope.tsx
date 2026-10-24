import { useEffect, useRef, useState } from "react";
import { Ornament } from "./shared";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function Envelope() {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [enter, setEnter] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setEnter(clamp(1 - r.top / window.innerHeight));
      // Read the current position in both directions; never latch the reveal.
      setP(clamp(-r.top / (total || 1)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const t = clamp(p / 0.3); // flap opening
  const flap = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease-in-out hinge
  const rise = clamp((p - 0.22) / 0.78); // extraction overlaps the opening, without a pause
  const ease = rise * rise * (3 - 2 * rise); // reversible easing without early overshoot
  const settle = ease;

  return (
    <section ref={ref} className="envelope-scroll parchment relative h-[300svh]" aria-label="Invitation letter">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute top-[6svh] text-center transition-opacity duration-500" style={{ opacity: Math.min(enter * 1.5, 1 - rise * 2) }}>
          <h2 className="font-script text-5xl text-primary sm:text-6xl">You’re Invited</h2>
          <Ornament />
        </div>

        {/* Envelope stage */}
        <div
          className="envelope relative aspect-[10/7] w-[min(86vw,420px,48svh)]"
          style={{
            opacity: clamp(enter * 1.4),
            transform: `translateY(calc(${(1 - enter) * 60}px + ${settle * 40}svh)) scale(${0.94 + enter * 0.06 - settle * 0.04})`,
            filter: `drop-shadow(0 ${12 + flap * 10}px ${18 + flap * 12}px oklch(0.3 0.08 30 / 0.3))`,
          }}
        >
          <div className="envelope-back absolute inset-0 rounded-md shadow-paper" />

          {/* Letter (clipped at envelope bottom, hidden behind the front pocket) */}
          <div className="absolute inset-x-[5%] bottom-[3%] top-[-260%] z-10 overflow-hidden">
            <article
              className="letter absolute inset-x-0 bottom-0 aspect-[10/17] rounded-sm px-[8%] py-[7%] text-center"
              style={{
                transform: `translateY(${82 - ease * 132}%)`,
                boxShadow: `0 ${8 + settle * 16}px ${20 + settle * 24}px -12px oklch(0.3 0.08 30 / ${0.25 + settle * 0.25})`,
              }}
            >
              <p className="font-display text-[0.5rem] tracking-[0.3em] text-gold sm:text-[0.65rem]">YOU ARE CORDIALLY</p>
              <h3 className="font-script text-[1.9rem] leading-none text-primary sm:text-[2.6rem]">Invited</h3>
              <Ornament />
              <div className="space-y-[0.55em] font-serif text-[0.72rem] leading-snug text-foreground sm:text-[0.88rem]">
                <p>As we begin a beautiful new chapter of our lives, we are filled with love, gratitude, and happiness.</p>
                <p>With the blessings of our families and the love of those who mean the most to us, we joyfully invite you to celebrate the beginning of our forever.</p>
                <p>Your presence and heartfelt blessings would make our special moments even more memorable as we promise to walk through life together, hand in hand.</p>
                <p className="pt-1 italic">With Love,</p>
              </div>
              <p className="font-script text-[1.6rem] leading-tight text-primary sm:text-[2.1rem]">Dhyaani &amp; Vinotha</p>
              <div className="mx-auto my-[0.4em] h-px w-2/3 bg-gold/60" />
              <div className="space-y-[0.4em] font-serif text-[0.72rem] italic leading-snug text-foreground sm:text-[0.88rem]">
                <p>Two hearts. One promise. A lifetime of love.</p>
                <p>We look forward to celebrating this beautiful beginning with you.</p>
                <p className="text-primary">Your presence is our greatest blessing.</p>
              </div>
            </article>
          </div>

          <div className="envelope-front absolute inset-0 z-20 rounded-md" />

          {/* Flap */}
          <div
            className="absolute inset-x-0 top-0 h-[62%] origin-top"
            style={{ transformStyle: "preserve-3d", transform: `perspective(900px) rotateX(${flap * 180}deg)`, zIndex: flap > 0.5 ? 5 : 30 }}
          >
            <div className="envelope-flap absolute inset-0" />
            <div className="envelope-flap-inner absolute inset-0" />
            <div
              className="absolute left-1/2 top-full flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center envelope-seal rounded-full font-script text-xl sm:size-14"
              style={{ opacity: 1 - flap * 2 }}
            >
              D&amp;V
            </div>
          </div>
        </div>

        <p
          className="absolute bottom-[5svh] font-display text-[0.65rem] tracking-[0.3em] text-muted-foreground"
          style={{ opacity: 1 - flap }}
        >
          SCROLL TO OPEN
        </p>
      </div>
    </section>
  );
}
