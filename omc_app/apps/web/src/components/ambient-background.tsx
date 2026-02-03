'use client';

const PARTICLES = [
  { top: '5%', left: '10%', size: 3, duration: 7, delay: 0, color: 'bg-emerald-500/40' },
  { top: '12%', left: '85%', size: 2, duration: 5, delay: 1.2, color: 'bg-cyan-400/30' },
  { top: '18%', left: '45%', size: 2.5, duration: 8, delay: 0.5, color: 'bg-emerald-400/35' },
  { top: '25%', left: '72%', size: 3, duration: 6, delay: 2.1, color: 'bg-blue-400/30' },
  { top: '32%', left: '18%', size: 2, duration: 9, delay: 0.8, color: 'bg-emerald-500/40' },
  { top: '38%', left: '58%', size: 2.5, duration: 6.5, delay: 1.7, color: 'bg-purple-400/25' },
  { top: '42%', left: '90%', size: 2, duration: 5.5, delay: 3.0, color: 'bg-cyan-400/30' },
  { top: '48%', left: '35%', size: 3.5, duration: 7.5, delay: 1.5, color: 'bg-emerald-500/40' },
  { top: '55%', left: '65%', size: 2, duration: 6.5, delay: 0.3, color: 'bg-blue-400/25' },
  { top: '60%', left: '8%', size: 2.5, duration: 8, delay: 2.5, color: 'bg-emerald-400/35' },
  { top: '66%', left: '78%', size: 3, duration: 5, delay: 1.0, color: 'bg-cyan-500/30' },
  { top: '72%', left: '52%', size: 2, duration: 7, delay: 3.5, color: 'bg-emerald-500/40' },
  { top: '78%', left: '22%', size: 2.5, duration: 6, delay: 0.7, color: 'bg-purple-400/25' },
  { top: '82%', left: '42%', size: 2, duration: 8.5, delay: 2.0, color: 'bg-blue-400/30' },
  { top: '88%', left: '88%', size: 3, duration: 5.5, delay: 1.8, color: 'bg-emerald-400/35' },
  { top: '92%', left: '15%', size: 2, duration: 7, delay: 0.4, color: 'bg-cyan-400/30' },
  { top: '10%', left: '30%', size: 2, duration: 6.2, delay: 2.8, color: 'bg-emerald-500/35' },
  { top: '50%', left: '5%', size: 3, duration: 7.8, delay: 0.9, color: 'bg-blue-500/25' },
  { top: '35%', left: '95%', size: 2, duration: 5.8, delay: 3.3, color: 'bg-emerald-400/30' },
  { top: '75%', left: '68%', size: 2.5, duration: 6.8, delay: 1.4, color: 'bg-cyan-400/35' },
  { top: '22%', left: '62%', size: 2, duration: 8.2, delay: 0.6, color: 'bg-purple-400/20' },
  { top: '95%', left: '50%', size: 3, duration: 5.2, delay: 2.3, color: 'bg-emerald-500/40' },
];

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Gradient Orb 1 - Emerald (top-left) */}
      <div
        className="animate-orb absolute rounded-full opacity-[0.06]"
        style={{
          top: '5%',
          left: '-8%',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.7) 0%, transparent 70%)',
          filter: 'blur(60px)',
          ['--duration' as string]: '10s',
          ['--delay' as string]: '0s',
        }}
      />

      {/* Gradient Orb 2 - Blue (bottom-right) */}
      <div
        className="animate-orb absolute rounded-full opacity-[0.05]"
        style={{
          bottom: '0%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.7) 0%, transparent 70%)',
          filter: 'blur(60px)',
          ['--duration' as string]: '12s',
          ['--delay' as string]: '3s',
        }}
      />

      {/* Gradient Orb 3 - Purple (center-right) */}
      <div
        className="animate-orb absolute rounded-full opacity-[0.04]"
        style={{
          top: '40%',
          right: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
          filter: 'blur(70px)',
          ['--duration' as string]: '14s',
          ['--delay' as string]: '5s',
        }}
      />

      {/* Gradient Orb 4 - Cyan (mid-left) */}
      <div
        className="animate-orb absolute rounded-full opacity-[0.035]"
        style={{
          top: '60%',
          left: '5%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.6) 0%, transparent 70%)',
          filter: 'blur(60px)',
          ['--duration' as string]: '11s',
          ['--delay' as string]: '7s',
        }}
      />

      {/* Floating Particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className={`floating-particle absolute rounded-full ${p.color}`}
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
