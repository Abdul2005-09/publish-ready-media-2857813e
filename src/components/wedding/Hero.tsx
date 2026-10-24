import { useEffect, useRef, useState } from "react";
import video from "@/assets/wedding-final.mp4.asset.json";
import poster from "@/assets/wedding-final-poster.jpg.asset.json";

// The names & date reveal in the video starts at ~12.9s and runs to the end (19s),
// so the message is hidden from just before that point until the loop restarts.
export const NAMES_REVEAL_AT = 12.7;

// Lines reveal one by one; the last appears ~10s, well before the names at 12.9s.
const LINE_START = 0.8;
const LINE_GAP = 2.3;
const LINES: [string, boolean][] = [
  ["Blessed by the Stars...", true],
  ["Surrounded by Loved Ones...", true],
  ["AND STEPPING INTO", false],
  ["A Lifetime of Love", true],
  ["And Happiness :)", true],
];

export function Hero({ active }: { active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [t, setT] = useState(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!active) {
      v.pause();
      return;
    }
    v.muted = true;
    let visible = false;
    let raf = 0;
    const tick = () => {
      setT(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const play = () => {
      if (visible) v.play().catch(() => {});
    };
    v.addEventListener("canplay", play);
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      if (visible) play();
      else v.pause();
    });
    io.observe(v);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      v.removeEventListener("canplay", play);
    };
  }, [active]);

  return (
    <section className="wedding-video flex h-svh items-center justify-center overflow-hidden">
      <div className="relative aspect-[9/16] h-full max-w-full">
        <video
          ref={ref}
          className="h-full w-full object-contain"
          poster={poster.url}
          src={video.url}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          aria-hidden
        />
        <div className="video-message pointer-events-none absolute inset-x-0 top-[30%] px-[8%] text-center">
          {LINES.map(([text, script], i) => (
            <p
              key={text}
              className={`video-line ${script ? "font-script" : "mt-[0.6em] font-display text-[0.42em] tracking-[0.3em]"}`}
              data-on={t >= LINE_START + i * LINE_GAP && t < NAMES_REVEAL_AT}
            >
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
