/** Halftone dot overlay. Sits on top of the yellow canvas at 7% opacity. */
export function Halftone() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 opacity-[0.07]"
      style={{
        backgroundImage: 'radial-gradient(#15120D 1.5px, transparent 1.5px)',
        backgroundSize: '18px 18px',
      }}
    />
  );
}
