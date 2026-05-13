'use client';

const PARTICLES = [
  { top: '8%', left: '12%', size: 3, duration: 7, delay: 0 },
  { top: '15%', left: '85%', size: 2, duration: 5, delay: 1.2 },
  { top: '25%', left: '45%', size: 2, duration: 8, delay: 0.5 },
  { top: '35%', left: '72%', size: 3, duration: 6, delay: 2.1 },
  { top: '45%', left: '18%', size: 2, duration: 9, delay: 0.8 },
  { top: '55%', left: '90%', size: 2, duration: 5.5, delay: 3.0 },
  { top: '60%', left: '35%', size: 3, duration: 7.5, delay: 1.5 },
  { top: '70%', left: '60%', size: 2, duration: 6.5, delay: 0.3 },
  { top: '78%', left: '8%', size: 2, duration: 8, delay: 2.5 },
  { top: '82%', left: '78%', size: 3, duration: 5, delay: 1.0 },
  { top: '20%', left: '55%', size: 2, duration: 7, delay: 3.5 },
  { top: '40%', left: '5%', size: 2, duration: 6, delay: 0.7 },
  { top: '65%', left: '48%', size: 2, duration: 8.5, delay: 2.0 },
  { top: '90%', left: '25%', size: 3, duration: 5.5, delay: 1.8 },
  { top: '50%', left: '92%', size: 2, duration: 7, delay: 0.4 },
];

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Gradient Orb 1 - Emerald */}
      <div
        className="animate-orb absolute rounded-full opacity-[0.04]"
        style={{
          top: '10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, transparent 70%)',
          filter: 'blur(60px)',
          ['--duration' as string]: '10s',
          ['--delay' as string]: '0s',
        }}
      />

      {/* Gradient Orb 2 - Blue */}
      <div
        className="animate-orb absolute rounded-full opacity-[0.04]"
        style={{
          bottom: '5%',
          right: '-8%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%)',
          filter: 'blur(60px)',
          ['--duration' as string]: '12s',
          ['--delay' as string]: '3s',
        }}
      />

      {/* Floating Particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="floating-particle absolute rounded-full bg-emerald-500/30"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            ['--duration' as string]: `${p.duration}s`,
            ['--delay' as string]: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
