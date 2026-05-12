/** Ink rail at the bottom of every Poster Arcade page. Three columns of live stats. */
export function StreakFooter() {
  return (
    <footer className="relative z-10 flex flex-col items-center justify-between gap-1 bg-ink px-4 py-2.5 text-center text-[12px] font-extrabold tracking-[0.04em] text-canvas md:flex-row md:gap-0 md:text-left">
      <span>🔥 4-day streak · keep it going</span>
      <span className="font-mono">★ 12 takes · $1,247 bag · +$214 royalties</span>
      <span>jesse · vitalik · prag · @degen.42 are online</span>
    </footer>
  );
}
