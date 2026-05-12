/* OMC · Poster Arcade — Screen previews
   One JSX file. Components for every redesigned route.
   Used by screens.html. */

const Y='#FFE94D', I='#15120D', P='#FF4D6B', C='#4DFFE0', W='#FFFFFF', M='rgba(21,18,13,0.65)';

/* ---------- shared ---------- */
const Dots = () => <div style={{ position:'absolute', inset: 0, opacity: 0.07, backgroundImage:`radial-gradient(${I} 1.5px, transparent 1.5px)`, backgroundSize:'18px 18px', pointerEvents:'none' }}/>;

const Page = ({ children, label, style }) => (
  <div style={{ width:'100%', height:'100%', background: Y, color: I, fontFamily:'Inter Tight, sans-serif', position:'relative', overflow:'hidden', ...style }}>
    <Dots/>
    <div style={{ position:'relative', zIndex: 1, width:'100%', height:'100%' }}>{children}</div>
    {label && <div style={{ position:'absolute', top: 8, right: 12, fontFamily:'JetBrains Mono', fontSize: 9, letterSpacing:'0.18em', opacity: 0.5, zIndex: 2 }}>{label}</div>}
  </div>
);

const Sticker = ({ bg=P, fg='#fff', tilt=-1.5, shadow=5, children, style }) => (
  <div style={{ background: bg, color: fg, border:`2.5px solid ${I}`, borderRadius: 14, padding:'14px 16px', boxShadow:`${shadow}px ${shadow}px 0 ${I}`, transform:`rotate(${tilt}deg)`, ...style }}>{children}</div>
);

const Chip = ({ children, bg=W, fg=I, sm }) => (
  <span style={{ display:'inline-block', background: bg, color: fg, border:`2px solid ${I}`, borderRadius: 999, padding: sm ? '1px 7px' : '2px 10px', fontSize: sm ? 9 : 11, fontWeight: 800 }}>{children}</span>
);

const Btn = ({ children, kind='ink', size='md', style }) => {
  const k = {
    ink:   { bg: I, fg: Y, shadow: `4px 4px 0 ${P}` },
    pop:   { bg: P, fg: '#fff', shadow: `4px 4px 0 ${I}` },
    cool:  { bg: C, fg: I, shadow: `4px 4px 0 ${I}` },
    ghost: { bg: W, fg: I, shadow: `4px 4px 0 ${I}` },
  }[kind];
  const pad = size === 'sm' ? '8px 14px' : '12px 22px';
  const fs = size === 'sm' ? 12 : 13;
  return <button style={{ background: k.bg, color: k.fg, border:`2.5px solid ${I}`, borderRadius: 999, padding: pad, fontWeight: 900, fontSize: fs, letterSpacing:'0.06em', boxShadow: k.shadow, cursor:'pointer', ...style }}>{children}</button>;
};

const Rail = () => (
  <div style={{ position:'absolute', bottom: 0, left: 0, right: 0, background: I, color: Y, padding:'8px 18px', display:'flex', justifyContent:'space-between', fontWeight: 800, fontSize: 12, letterSpacing:'0.04em', zIndex: 2 }}>
    <span>🔥 4-day streak · keep it going</span>
    <span>★ 12 takes · $1,247 bag · +$214 royalties</span>
    <span>jesse · vitalik · prag are online</span>
  </div>
);

const Nav = ({ active='hot' }) => (
  <div style={{ padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`2.5px dashed ${I}` }}>
    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
      <span style={{ width: 28, height: 28, borderRadius:'50%', background: P, border:`2.5px solid ${I}`, display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight: 900, fontSize: 13, boxShadow:`2px 2px 0 ${I}` }}>★</span>
      <span style={{ fontWeight: 900, fontSize: 20, letterSpacing:'-0.03em' }}>OMC</span>
    </div>
    <div style={{ display:'flex', gap: 16, fontSize: 12, fontWeight: 700 }}>
      {['Hot','Marketplace','Leaderboard','Pools'].map(t => (
        <span key={t} style={{ borderBottom: active === t.toLowerCase() ? `2px solid ${I}` : 'none', paddingBottom: 2 }}>{t}</span>
      ))}
    </div>
    <Btn kind="ink" size="sm">★ NEW TAKE</Btn>
  </div>
);

/* ---------- 1. Landing ---------- */
const Landing = () => (
  <Page label="/  · LANDING">
    <Nav active="hot"/>
    {/* hero */}
    <div style={{ padding:'24px 26px', display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 22, alignItems:'center', borderBottom:`2.5px dashed ${I}` }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing:'0.18em' }}>★ EVERY OPINION HAS A PRICE ★</div>
        <div style={{ fontWeight: 900, fontSize: 70, letterSpacing:'-0.04em', lineHeight: 0.92, marginTop: 6 }}>Take a stand.<br/><span style={{ color: P }}>Get paid</span> for it.</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12, maxWidth: 440 }}>Mint your hot take. Hold the floor. When someone outbids you — they pay you to leave. <b>You keep 3% forever.</b></div>
        <div style={{ display:'flex', gap: 10, marginTop: 18 }}>
          <Btn kind="pop">★ MINT YOUR FIRST TAKE</Btn>
          <Btn kind="ghost">browse the floor →</Btn>
        </div>
      </div>
      <div style={{ position:'relative', height: 250 }}>
        <Sticker bg={P} fg="#fff" tilt={-3} style={{ position:'absolute', top: 0, left: 0, width: 220 }}>
          <Chip>🏀 SPORTS</Chip>
          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, opacity: 0.9 }}>"GOAT BASKETBALL?"</div>
          <div style={{ fontWeight: 900, fontSize: 36, letterSpacing:'-0.03em', lineHeight: 0.9, marginTop: 4 }}>JORDAN.</div>
          <div style={{ fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 13, marginTop: 6 }}>$142 · +18%</div>
        </Sticker>
        <Sticker bg={C} fg={I} tilt={4} style={{ position:'absolute', top: 60, right: 0, width: 200 }}>
          <Chip bg={I} fg={C}>⚡ CRYPTO</Chip>
          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>"BEST L2?"</div>
          <div style={{ fontWeight: 900, fontSize: 36, letterSpacing:'-0.03em', lineHeight: 0.9, marginTop: 4 }}>BASE.</div>
          <div style={{ fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 13, marginTop: 6 }}>$312 · +9.6%</div>
        </Sticker>
        <Sticker bg="#fff" fg={I} tilt={-2} style={{ position:'absolute', bottom: 0, left: 60, width: 200 }}>
          <Chip bg={Y} fg={I}>🎬 CINEMA</Chip>
          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>"GOAT PIXAR?"</div>
          <div style={{ fontWeight: 900, fontSize: 32, letterSpacing:'-0.03em', lineHeight: 0.9, marginTop: 4 }}>WALL-E.</div>
          <div style={{ fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 13, marginTop: 6 }}>$28 · NEW</div>
        </Sticker>
      </div>
    </div>
    {/* hot wall */}
    <div style={{ padding:'16px 26px 50px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 22 }}>🔥 HOT WALL · TODAY</div>
        <div style={{ fontFamily:'JetBrains Mono', fontSize: 11, fontWeight: 700 }}>847 takes · $284k vol · 12 fresh</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14, padding:'4px 4px 8px' }}>
        {[
          { cat:'🎵 MUSIC', q:'GOAT album?', a:'OK COMPUTER', p:'$96', d:'+6%', tilt:-1.5, bg:P, fg:'#fff' },
          { cat:'🍕 FOOD',  q:'Best pizza?', a:'NY SLICE',    p:'$12', d:'+22%', tilt:1.5, bg:Y, fg:I },
          { cat:'🎬 CINEMA',q:'Tarantino?',  a:'PULP FICTION',p:'$54', d:'-3%',  tilt:-2,  bg:C, fg:I },
          { cat:'🏀 SPORTS',q:'GOAT QB?',    a:'MAHOMES',     p:'$56', d:'+4%',  tilt:2,   bg:'#fff', fg:I },
        ].map((c, i) => (
          <Sticker key={i} bg={c.bg} fg={c.fg} tilt={c.tilt}>
            <Chip bg={c.bg === '#fff' ? Y : '#fff'} fg={I} sm>{c.cat}</Chip>
            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, opacity: 0.85 }}>"{c.q}"</div>
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing:'-0.03em', lineHeight: 0.95, marginTop: 2 }}>{c.a}</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 12, marginTop: 6 }}>
              <span>{c.p}</span><span>{c.d}</span>
            </div>
          </Sticker>
        ))}
      </div>
    </div>
    <Rail/>
  </Page>
);

/* ---------- 2. Marketplace ---------- */
const Marketplace = () => (
  <Page label="/marketplace">
    <Nav active="marketplace"/>
    <div style={{ padding:'20px 26px 14px' }}>
      <div style={{ fontWeight: 900, fontSize: 56, letterSpacing:'-0.04em', lineHeight: 0.92 }}>THE FLOOR.</div>
      <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7, marginTop: 4 }}>every take, every price</div>
    </div>
    <div style={{ padding:'0 26px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14 }}>
      <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
        {['ALL', '🏀 SPORTS', '⚡ CRYPTO', '🎬 CINEMA', '🤖 AI', '🍕 FOOD', '🌍 LIFE', '🎵 MUSIC'].map((c, i) => (
          <span key={c} style={{ background: i === 0 ? I : W, color: i === 0 ? Y : I, border:`2px solid ${I}`, borderRadius: 999, padding:'4px 12px', fontWeight: 800, fontSize: 11, boxShadow: i === 0 ? `2px 2px 0 ${P}` : 'none' }}>{c}</span>
        ))}
      </div>
      <select style={{ background: W, border:`2px solid ${I}`, borderRadius: 999, padding:'6px 14px', fontWeight: 800, fontSize: 11, fontFamily:'inherit' }}>
        <option>SORT: HOT</option>
        <option>TOP GAINERS</option>
        <option>SPICIEST</option>
      </select>
    </div>
    <div style={{ padding:'0 26px', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14 }}>
      {[
        { cat:'⚡ CRYPTO', q:'Best L2?',       a:'BASE',      p:'$312', d:'+9.6%', tilt:-1.5, bg:C,  fg:I },
        { cat:'🤖 AI',     q:'AI by 2030?',    a:'PARTIALLY', p:'$64',  d:'+34%',  tilt:2,    bg:P,  fg:'#fff' },
        { cat:'🏀 SPORTS', q:'GOAT basket?',   a:'JORDAN',    p:'$142', d:'+18%',  tilt:-2,   bg:Y,  fg:I },
        { cat:'🎬 CINEMA', q:'Best Pixar?',    a:'WALL-E',    p:'$28',  d:'+22%',  tilt:1.5,  bg:'#fff', fg:I },
        { cat:'🍕 FOOD',   q:'Best burrito?',  a:'MISSION',   p:'$10',  d:'+8%',   tilt:-1.5, bg:P,  fg:'#fff' },
        { cat:'🚀 FOUND',  q:'Best founder?',  a:'JOBS',      p:'$78',  d:'-2%',   tilt:2,    bg:C,  fg:I },
        { cat:'🌍 LIFE',   q:'Best city 30?',  a:'LISBON',    p:'$142', d:'+18%',  tilt:-1.5, bg:Y,  fg:I },
        { cat:'🎵 MUSIC',  q:'GOAT album?',    a:'OK COMP',   p:'$96',  d:'+6%',   tilt:1.5,  bg:'#fff', fg:I },
      ].map((c, i) => (
        <Sticker key={i} bg={c.bg} fg={c.fg} tilt={c.tilt}>
          <Chip bg={c.bg === '#fff' || c.bg === Y ? (c.bg === Y ? '#fff' : Y) : '#fff'} fg={I} sm>{c.cat}</Chip>
          <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, opacity: 0.85 }}>"{c.q}"</div>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing:'-0.03em', lineHeight: 0.95, marginTop: 2 }}>{c.a}</div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 12, marginTop: 6 }}>
            <span>{c.p}</span><span>{c.d}</span>
          </div>
        </Sticker>
      ))}
    </div>
  </Page>
);

/* ---------- 3. Opinion Detail ---------- */
const OpinionDetail = () => (
  <Page label="/opinions/[id]">
    <Nav/>
    <div style={{ padding:'18px 26px', display:'grid', gridTemplateColumns:'1.5fr 1fr', gap: 22 }}>
      {/* left: the take */}
      <div>
        <Sticker bg={P} fg="#fff" tilt={-2} shadow={6} style={{ padding:'28px 28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <Chip>🏀 SPORTS</Chip>
            <Chip bg={I} fg={P} sm>#42</Chip>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, opacity: 0.85, fontStyle:'italic' }}>"GOAT basketball?"</div>
          <div style={{ fontWeight: 900, fontSize: 96, letterSpacing:'-0.04em', lineHeight: 0.88, marginTop: 8 }}>JORDAN.</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop: 14, fontFamily:'JetBrains Mono', fontWeight: 800 }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.7, letterSpacing:'0.1em' }}>HELD BY</div>
              <div style={{ fontSize: 18 }}>@vitalik.eth</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize: 10, opacity: 0.7, letterSpacing:'0.1em' }}>FLOOR</div>
              <div style={{ fontSize: 30 }}>$142.50</div>
            </div>
          </div>
        </Sticker>
        <div style={{ marginTop: 16, padding:'14px 16px', background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14 }}>📈 PRICE HISTORY</div>
              <div style={{ fontSize: 10, fontFamily:'JetBrains Mono', opacity: 0.6, marginTop: 2 }}>$25 → $142.50 · +470% in 30d</div>
            </div>
            <div style={{ display:'flex', gap: 4 }}>
              {['24H', '7D', '30D', 'ALL'].map((t, i) => (
                <span key={t} style={{ padding:'3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 800, background: i === 2 ? I : 'transparent', color: i === 2 ? Y : I, border:`1.5px solid ${I}` }}>{t}</span>
              ))}
            </div>
          </div>
          {/* chart with axes */}
          <svg viewBox="0 0 360 200" style={{ width:'100%', height: 200, display:'block' }}>
            {/* Y-axis grid + labels */}
            {[
              { y: 30, v: '$150' },
              { y: 60, v: '$125' },
              { y: 90, v: '$100' },
              { y: 120, v: '$75' },
              { y: 150, v: '$50' },
              { y: 180, v: '$25' },
            ].map(g => (
              <g key={g.y}>
                <line x1="40" y1={g.y} x2="356" y2={g.y} stroke={I} strokeOpacity="0.12" strokeWidth="1" strokeDasharray="2 3"/>
                <text x="36" y={g.y + 3} fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" textAnchor="end" fill={I} opacity="0.6">{g.v}</text>
              </g>
            ))}
            {/* axes */}
            <line x1="40" y1="20" x2="40" y2="180" stroke={I} strokeWidth="1.5"/>
            <line x1="40" y1="180" x2="356" y2="180" stroke={I} strokeWidth="1.5"/>
            {/* X-axis labels (5 ticks across 30 days) */}
            {[
              { x: 40,  v: 'Mar 1' },
              { x: 119, v: 'Mar 8' },
              { x: 198, v: 'Mar 15' },
              { x: 277, v: 'Mar 22' },
              { x: 356, v: 'Mar 30' },
            ].map(t => (
              <g key={t.x}>
                <line x1={t.x} y1="178" x2={t.x} y2="184" stroke={I} strokeWidth="1.5"/>
                <text x={t.x} y="196" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" textAnchor="middle" fill={I} opacity="0.7">{t.v}</text>
              </g>
            ))}
            {/* Area fill (cyan glow) */}
            <path d="M 40,156 L 64,150 L 88,148 L 112,138 L 136,120 L 160,118 L 184,112 L 208,100 L 232,98 L 256,86 L 280,82 L 304,68 L 328,60 L 356,42 L 356,180 L 40,180 Z" fill={C} opacity="0.22"/>
            {/* Line */}
            <polyline points="40,156 64,150 88,148 112,138 136,120 160,118 184,112 208,100 232,98 256,86 280,82 304,68 328,60 356,42" fill="none" stroke={I} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
            {/* Owner-change vertical markers */}
            {[
              { x: 40,  label: '@jesse mints',    bg: I, fg: Y },
              { x: 136, label: '@degen takes $54', bg: C, fg: I },
              { x: 256, label: '@meme takes $98', bg: Y, fg: I },
              { x: 356, label: '@vitalik · NOW',  bg: P, fg: '#fff' },
            ].map((m, i) => (
              <g key={i}>
                <line x1={m.x} y1="20" x2={m.x} y2="180" stroke={I} strokeWidth="1" strokeDasharray="3 3" opacity="0.3"/>
                <circle cx={m.x} cy={i === 0 ? 156 : i === 1 ? 120 : i === 2 ? 86 : 42} r="5" fill={m.bg} stroke={I} strokeWidth="2"/>
              </g>
            ))}
            {/* Current price callout */}
            <g transform="translate(296, 16)">
              <rect x="0" y="0" width="60" height="20" rx="4" fill={P} stroke={I} strokeWidth="1.5"/>
              <text x="30" y="14" fontFamily="JetBrains Mono" fontSize="10" fontWeight="900" textAnchor="middle" fill="#fff">$142.50</text>
            </g>
          </svg>
          {/* legend below */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 8, paddingTop: 8, borderTop:`2px dashed ${I}33`, fontFamily:'JetBrains Mono', fontSize: 10 }}>
            <span style={{ display:'flex', alignItems:'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius:'50%', background: I, display:'inline-block' }}/>price</span>
            <span style={{ display:'flex', alignItems:'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius:'50%', background: C, display:'inline-block' }}/>volume</span>
            <span style={{ display:'flex', alignItems:'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius:'50%', background: P, display:'inline-block' }}/>owner change</span>
            <span style={{ opacity: 0.6 }}>4 owners · 12 watchers</span>
          </div>
          {/* stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8, marginTop: 10, padding:'10px 0 4px', borderTop:`2px dashed ${I}33` }}>
            {[['FLOOR','$142.50',I],['LAST','$138.00',I],['24H VOL','$4.2k',I],['HOLDERS','12',I]].map(([k,v,c]) => (
              <div key={k}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing:'0.1em', opacity: 0.6 }}>{k}</div>
                <div style={{ fontFamily:'JetBrains Mono', fontWeight: 900, fontSize: 14, marginTop: 2, color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* right: trade slip */}
      <div>
        <Sticker bg={W} fg={I} tilt={-1}>
          <div style={{ display:'flex', gap: 4, marginBottom: 14 }}>
            {['TAKE IT', 'OFFER', 'WATCH'].map((t, i) => (
              <span key={t} style={{ flex: 1, textAlign:'center', padding:'6px 0', borderRadius: 999, fontSize: 11, fontWeight: 900, background: i === 0 ? I : 'transparent', color: i === 0 ? Y : I, border:`2px solid ${I}` }}>{t}</span>
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing:'0.14em', marginBottom: 4 }}>YOUR BID</div>
          <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
            <span style={{ fontFamily:'JetBrains Mono', fontWeight: 900, fontSize: 38 }}>$163.87</span>
            <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.6 }}>15% over floor</span>
          </div>
          <div style={{ marginTop: 12, padding:'10px 0', borderTop:`2px dashed ${I}55`, borderBottom:`2px dashed ${I}55`, fontSize: 11, fontFamily:'JetBrains Mono' }}>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'2px 0' }}><span>floor</span><b>$142.50</b></div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'2px 0' }}><span>+ 15% premium</span><b style={{ color: P }}>$21.37</b></div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'2px 0', opacity: 0.6 }}><span>- 3% royalty (to @vitalik)</span><span>-$4.92</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 0 0', marginTop: 4, borderTop:`2px solid ${I}`, fontWeight: 900 }}><span>TOTAL</span><span>$163.87</span></div>
          </div>
          <Btn kind="pop" style={{ width:'100%', marginTop: 14 }}>★ TAKE IT · $163</Btn>
          <div style={{ fontSize: 10, fontStyle:'italic', opacity: 0.65, textAlign:'center', marginTop: 8 }}>★ keep 3% forever after they take it</div>
        </Sticker>
        <div style={{ marginTop: 12, fontSize: 11, fontFamily:'JetBrains Mono', fontWeight: 700, padding:'10px 14px', background: I, color: Y, borderRadius: 8, display:'flex', justifyContent:'space-between' }}>
          <span>🔒 SEALED for 18h 42m</span><span>cannot be taken yet</span>
        </div>
      </div>
    </div>
    {/* holders timeline */}
    <div style={{ padding:'0 26px 16px', marginTop: 8 }}>
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>👥 WHO HELD THIS</div>
      <div style={{ background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
        {[
          { who:'vitalik.eth', p:'$142.50', d:'today',     active:true },
          { who:'meme.lord',   p:'$98.00',  d:'3 days ago' },
          { who:'@degen.42',   p:'$54.00',  d:'2 weeks ago' },
          { who:'jesse.base',  p:'$25.00',  d:'minted · 1 mo ago' },
        ].map((r, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'30px 1fr 100px 1fr', alignItems:'center', padding:'10px 16px', borderTop: i ? `2px dashed ${I}33` : 'none', fontSize: 12 }}>
            <span style={{ width: 14, height: 14, borderRadius:'50%', background: r.active ? P : I, border:`2px solid ${I}` }}/>
            <span><b>@{r.who}</b>{r.active && <Chip bg={P} fg="#fff" sm style={{ marginLeft: 6 }}>HOLDING</Chip>}</span>
            <span style={{ fontFamily:'JetBrains Mono', fontWeight: 800 }}>{r.p}</span>
            <span style={{ opacity: 0.6, fontSize: 11 }}>{r.d}</span>
          </div>
        ))}
      </div>
    </div>
  </Page>
);

/* ---------- 4. Create (3-step) ---------- */
const Create = () => (
  <Page label="/create · STEP 3 OF 3">
    <div style={{ padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <Btn kind="ghost" size="sm">← cancel</Btn>
      <span style={{ fontWeight: 900, fontSize: 13, letterSpacing:'0.1em' }}>NEW TAKE · STEP 3/3 · PRICE IT</span>
      <div style={{ display:'flex', gap: 4 }}>
        {[1,2,3].map(n => <span key={n} style={{ width: 16, height: 16, borderRadius:'50%', background: n <= 3 ? P : W, border:`2px solid ${I}` }}/>)}
      </div>
    </div>
    <div style={{ padding:'8px 26px', display:'grid', gridTemplateColumns:'1.2fr 1fr', gap: 24, alignItems:'start' }}>
      <div>
        <Sticker bg={P} fg="#fff" tilt={-2} shadow={6} style={{ padding:'24px 26px' }}>
          <Chip>🌍 LIFE</Chip>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, opacity: 0.85, fontStyle:'italic' }}>"BEST PLACE TO LIVE IN 2030?"</div>
          <div style={{ fontWeight: 900, fontSize: 88, letterSpacing:'-0.04em', lineHeight: 0.9, marginTop: 8 }}>LISBON.</div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 12, fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 14 }}>
            <span>@you · just now</span>
            <span>$25 · NEW</span>
          </div>
        </Sticker>
        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 10, opacity: 0.7, textAlign:'center', fontStyle:'italic' }}>↑ this is how it'll look on the wall</div>
      </div>
      <div>
        <div style={{ background: W, border:`2.5px solid ${I}`, borderRadius: 14, padding:'18px 20px', boxShadow:`4px 4px 0 ${I}` }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing:'0.14em' }}>★ STARTING PRICE</div>
          <div style={{ fontFamily:'JetBrains Mono', fontWeight: 900, fontSize: 48, marginTop: 8 }}>$25</div>
          <div style={{ height: 10, background: I, borderRadius: 999, position:'relative', marginTop: 12 }}>
            <div style={{ position:'absolute', left: 0, width:'24%', top: 0, bottom: 0, background: P, borderRadius: 999 }}/>
            <div style={{ position:'absolute', left:'24%', top:'50%', width: 26, height: 26, transform:'translate(-50%, -50%)', background: Y, border:`2.5px solid ${I}`, borderRadius:'50%', boxShadow:`2px 2px 0 ${I}` }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 10, marginTop: 6, opacity: 0.6 }}>
            <span>$1 chump</span><span>$25 brave</span><span>$100 unhinged</span>
          </div>
          <div style={{ marginTop: 16, padding:'12px 14px', background: Y, border:`2px solid ${I}`, borderRadius: 10, fontSize: 11, fontWeight: 700, lineHeight: 1.5 }}>
            ★ you keep <b>3% of every flip, forever</b> — even after they take it from you.
          </div>
          <Btn kind="ink" style={{ width:'100%', marginTop: 14 }}>★ MINT THIS TAKE · $25 ★</Btn>
        </div>
      </div>
    </div>
  </Page>
);

/* ---------- 5. Portfolio ---------- */
const Portfolio = () => (
  <Page label="/portfolio · YOUR ROOM">
    <Nav/>
    <div style={{ padding:'18px 26px 0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', borderBottom:`2.5px dashed ${I}`, paddingBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing:'0.18em' }}>★ YOUR ROOM</div>
          <div style={{ fontWeight: 900, fontSize: 32, letterSpacing:'-0.03em', marginTop: 2 }}>The takes you're holding.</div>
        </div>
        <div style={{ display:'flex', gap: 22 }}>
          {[['BAG','$1,247', I], ['7d','+18.4%', P], ['ROYAL','+$214', I], ['🔥','4', P]].map(([k,v,c]) => (
            <div key={k}><div style={{ fontSize: 10, fontWeight: 800, letterSpacing:'0.1em' }}>{k}</div><div style={{ fontFamily:'JetBrains Mono', fontWeight: 900, fontSize: 18, color: c, marginTop: 2 }}>{v}</div></div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ padding:'14px 26px' }}>
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>★ STILL HOLDING · 4</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14, padding:'4px 4px 16px' }}>
        {[
          { cat:'⚡ CRYPTO', q:'Best L2?',    a:'BASE',     p:'$312', d:'+9.6%', tilt:-1.5, bg:C, fg:I },
          { cat:'🤖 AI',     q:'AI by 2030?', a:'PARTIAL',  p:'$64',  d:'+34%',  tilt:2,    bg:P, fg:'#fff' },
          { cat:'🏀 SPORT',  q:'GOAT QB?',    a:'MAHOMES',  p:'$56',  d:'-4%',   tilt:-2,   bg:'#fff', fg:I },
          { cat:'🎬 CIN',    q:'Goat Pixar?', a:'WALL-E',   p:'$28',  d:'+22%',  tilt:1.5,  bg:Y, fg:I },
        ].map((c, i) => (
          <Sticker key={i} bg={c.bg} fg={c.fg} tilt={c.tilt}>
            <Chip bg={c.bg === '#fff' || c.bg === Y ? I : '#fff'} fg={c.bg === '#fff' || c.bg === Y ? Y : I} sm>{c.cat}</Chip>
            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, opacity: 0.85 }}>"{c.q}"</div>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing:'-0.03em', lineHeight: 0.95, marginTop: 2 }}>{c.a}</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 12, marginTop: 6 }}><span>{c.p}</span><span>{c.d}</span></div>
          </Sticker>
        ))}
      </div>

      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>💔 TAKEN BUT STILL EARNING · 3</div>
      <div style={{ background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
        {[
          { cat:'🏀', q:'GOAT basketball?', a:'JORDAN',  by:'vitalik',  r:'+$28' },
          { cat:'🍕', q:'Best burrito?',    a:'MISSION', by:'meme.lord',r:'+$2.50' },
          { cat:'🚀', q:'Best founder?',    a:'JOBS',    by:'@degen.42',r:'+$14' },
        ].map((r, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'30px 1fr 90px', alignItems:'center', padding:'10px 16px', borderTop: i ? `2px dashed ${I}33` : 'none', fontSize: 12 }}>
            <span style={{ fontSize: 18 }}>{r.cat}</span>
            <span><span style={{ fontStyle:'italic', opacity: 0.65, fontSize: 11 }}>"{r.q}"</span> → <s>{r.a}</s> taken by <b>@{r.by}</b></span>
            <span style={{ textAlign:'right', fontFamily:'JetBrains Mono', fontWeight: 900, color: P }}>{r.r}</span>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap: 10, marginTop: 14 }}>
        <Btn kind="pop" style={{ flex: 1 }}>★ MINT NEW TAKE</Btn>
        <Btn kind="cool" style={{ flex: 1 }}>CASH OUT $214</Btn>
      </div>
    </div>
  </Page>
);

/* ---------- 6. Leaderboard ---------- */
const Leaderboard = () => (
  <Page label="/leaderboard · HALL OF TAKES">
    <Nav active="leaderboard"/>
    <div style={{ padding:'18px 26px 14px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', borderBottom:`2.5px dashed ${I}`, paddingBottom: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing:'0.18em' }}>★ HALL OF TAKES</div>
          <div style={{ fontWeight: 900, fontSize: 32, letterSpacing:'-0.03em', marginTop: 2 }}>This week's loudest minds.</div>
        </div>
        <div style={{ display:'flex', gap: 6 }}>
          {['24H','WEEK','MONTH','ALL'].map((p,i) => (
            <span key={p} style={{ padding:'6px 12px', borderRadius: 999, fontWeight: 800, fontSize: 11, border:`2px solid ${I}`, background: i === 1 ? I : W, color: i === 1 ? Y : I, boxShadow: i === 1 ? `2px 2px 0 ${P}` : 'none' }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr 1fr', gap: 14, alignItems:'end', marginBottom: 16 }}>
        {[
          { r:2, who:'jesse.base',  bag:'$31,420', medal:'🥈', bg:C, tilt:-2 },
          { r:1, who:'vitalik.eth', bag:'$48,210', medal:'👑', bg:P, tilt: 0 },
          { r:3, who:'prag.base',   bag:'$22,860', medal:'🥉', bg:Y, tilt: 2 },
        ].map(p => (
          <Sticker key={p.r} bg={p.bg} fg={p.bg === P ? '#fff' : I} tilt={p.tilt} shadow={6} style={{ textAlign:'center', padding:'18px 16px' }}>
            <div style={{ fontSize: 36 }}>{p.medal}</div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>@{p.who}</div>
            <div style={{ fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 14, marginTop: 4 }}>{p.bag}</div>
          </Sticker>
        ))}
      </div>
      <div style={{ background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
        <div style={{ display:'grid', gridTemplateColumns:'40px 1.3fr 1.3fr 90px 90px 70px 70px', padding:'8px 14px', fontSize: 10, fontWeight: 800, letterSpacing:'0.1em', textTransform:'uppercase', borderBottom:`2px solid ${I}` }}>
          <span>#</span><span>Who</span><span>Best take</span><span style={{ textAlign:'right' }}>Bag</span><span style={{ textAlign:'right' }}>Royalty</span><span style={{ textAlign:'right' }}>Flips</span><span style={{ textAlign:'right' }}>Streak</span>
        </div>
        {[
          { r:'04', who:'@degen.42',   best:'best-pixar',  bag:'$14,210', roy:'+$622', f:16, s:3 },
          { r:'05', who:'meme.lord',   best:'best-burrito',bag:'$9,480',  roy:'+$418', f:11, s:2 },
          { r:'06', who:'0xA1...3F',   best:'btc-200k',    bag:'$1,247',  roy:'+$214', f:12, s:4, you:true },
          { r:'07', who:'hodlfren',    best:'btc-200k',    bag:'$880',    roy:'+$48',  f:6,  s:0 },
        ].map((r, i) => (
          <div key={r.r} style={{ display:'grid', gridTemplateColumns:'40px 1.3fr 1.3fr 90px 90px 70px 70px', padding:'8px 14px', fontSize: 12, alignItems:'center', borderTop:`2px dashed ${I}33`, background: r.you ? Y : 'transparent' }}>
            <span style={{ fontFamily:'JetBrains Mono', fontWeight: 800 }}>{r.r}</span>
            <span><b>@{r.who}</b>{r.you && <Chip bg={P} fg="#fff" sm style={{ marginLeft: 6 }}>YOU</Chip>}</span>
            <span style={{ fontStyle:'italic', opacity: 0.65, fontSize: 11 }}>{r.best}</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right', fontWeight: 800 }}>{r.bag}</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right', fontWeight: 800, color: P }}>{r.roy}</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right' }}>{r.f}</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right' }}>{r.s ? `${r.s}🔥` : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  </Page>
);

/* ---------- 7. Profile (public) — full data ---------- */
const Profile = () => (
  <Page label="/profile/0x9786...4D8C">
    <Nav/>
    <div style={{ padding:'20px 26px 60px' }}>
      {/* HERO */}
      <div style={{ display:'flex', alignItems:'center', gap: 20, marginBottom: 14 }}>
        <div style={{ width: 96, height: 96, borderRadius:'50%', background: P, border:`3px solid ${I}`, boxShadow:`5px 5px 0 ${I}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight: 900, fontSize: 36 }}>V</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing:'0.18em', opacity: 0.6 }}>★ COLLECTOR · RANK #04 · JOINED FEB 2025</div>
          <div style={{ fontWeight: 900, fontSize: 36, letterSpacing:'-0.03em', marginTop: 2 }}>@vitalik.eth</div>
          <div style={{ display:'flex', gap: 8, alignItems:'center', marginTop: 4 }}>
            <span style={{ fontFamily:'JetBrains Mono', fontSize: 11, fontWeight: 700, padding:'2px 8px', background: I, color: Y, borderRadius: 6 }}>0x9786…4D8C</span>
            <Chip bg={C} fg={I} sm>● online</Chip>
            <Chip bg={Y} fg={I} sm>🔥 12-day streak</Chip>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.75, marginTop: 6, fontStyle:'italic' }}>"opinions are like positions. mine just happen to be priced."</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          <Btn kind="pop" size="sm">★ FOLLOW · 2.4k</Btn>
          <Btn kind="ghost" size="sm">share profile ↗</Btn>
        </div>
      </div>

      {/* STATS GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap: 10, marginBottom: 18, padding:'14px 18px', background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
        {[
          { k:'TOTAL BAG',  v:'$48,210', d:'+18% 7d',  c: P },
          { k:'HOLDING',    v:'14',      d:'opinions', c: I },
          { k:'CREATED',    v:'8',       d:'minted',   c: I },
          { k:'ROYALTIES',  v:'+$1,420', d:'lifetime', c: P },
          { k:'FLIPS',      v:'32',      d:'24 wins',  c: I },
          { k:'WIN RATE',   v:'75%',     d:'top 5%',   c: P },
        ].map(s => (
          <div key={s.k}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing:'0.12em', opacity: 0.6 }}>{s.k}</div>
            <div style={{ fontFamily:'JetBrains Mono', fontWeight: 900, fontSize: 22, marginTop: 4, color: s.c, letterSpacing:'-0.02em' }}>{s.v}</div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize: 9, fontWeight: 700, opacity: 0.55, marginTop: 1 }}>{s.d}</div>
          </div>
        ))}
      </div>

      {/* CHART + HEATMAP */}
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap: 14, marginBottom: 18 }}>
        {/* portfolio value chart */}
        <div style={{ padding:'12px 14px', background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13 }}>📈 PORTFOLIO VALUE</div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize: 10, opacity: 0.6 }}>30 days · $12k → $48.2k</div>
            </div>
            <div style={{ display:'flex', gap: 3 }}>
              {['7D','30D','ALL'].map((t,i) => <span key={t} style={{ padding:'2px 7px', fontSize: 9, fontWeight: 800, borderRadius: 999, background: i === 1 ? I : 'transparent', color: i === 1 ? Y : I, border:`1.5px solid ${I}` }}>{t}</span>)}
            </div>
          </div>
          <svg viewBox="0 0 360 160" style={{ width:'100%', height: 160 }}>
            {/* Y grid */}
            {[
              { y: 20,  v:'$50k' },
              { y: 55,  v:'$38k' },
              { y: 90,  v:'$26k' },
              { y: 125, v:'$14k' },
            ].map(g => (
              <g key={g.y}>
                <line x1="38" y1={g.y} x2="356" y2={g.y} stroke={I} strokeOpacity="0.12" strokeDasharray="2 3"/>
                <text x="34" y={g.y + 3} fontFamily="JetBrains Mono" fontSize="8" fontWeight="700" textAnchor="end" fill={I} opacity="0.6">{g.v}</text>
              </g>
            ))}
            <line x1="38" y1="20" x2="38" y2="140" stroke={I} strokeWidth="1.5"/>
            <line x1="38" y1="140" x2="356" y2="140" stroke={I} strokeWidth="1.5"/>
            {/* X labels */}
            {[
              { x: 38,  v:'Mar 1' },
              { x: 118, v:'Mar 8' },
              { x: 198, v:'Mar 15' },
              { x: 278, v:'Mar 22' },
              { x: 356, v:'Mar 30' },
            ].map(t => (
              <text key={t.x} x={t.x} y="154" fontFamily="JetBrains Mono" fontSize="8" fontWeight="700" textAnchor="middle" fill={I} opacity="0.7">{t.v}</text>
            ))}
            {/* Area + line */}
            <path d="M 38,128 L 70,124 L 102,115 L 134,110 L 166,98 L 198,84 L 230,80 L 262,62 L 294,52 L 326,42 L 356,28 L 356,140 L 38,140 Z" fill={P} opacity="0.18"/>
            <polyline points="38,128 70,124 102,115 134,110 166,98 198,84 230,80 262,62 294,52 326,42 356,28" fill="none" stroke={I} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
            <circle cx="356" cy="28" r="5" fill={P} stroke={I} strokeWidth="2"/>
            <g transform="translate(296, 6)">
              <rect width="60" height="18" rx="4" fill={P} stroke={I} strokeWidth="1.5"/>
              <text x="30" y="13" fontFamily="JetBrains Mono" fontSize="10" fontWeight="900" textAnchor="middle" fill="#fff">$48.2k</text>
            </g>
          </svg>
        </div>
        {/* activity heatmap */}
        <div style={{ padding:'12px 14px', background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
          <div style={{ fontWeight: 900, fontSize: 13 }}>🔥 ACTIVITY · 12 WEEKS</div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize: 10, opacity: 0.6, marginBottom: 8 }}>148 actions · 12-day streak</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap: 3 }}>
            {Array.from({length: 84}).map((_, i) => {
              const v = Math.floor(Math.abs(Math.sin(i * 1.7)) * 4);
              const bg = v === 0 ? '#0001' : v === 1 ? Y : v === 2 ? C : P;
              return <div key={i} style={{ aspectRatio: '1', background: bg, border:`1px solid ${I}22`, borderRadius: 2 }}/>;
            })}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 8, fontFamily:'JetBrains Mono', fontSize: 9, opacity: 0.6 }}>
            <span>less</span>
            <div style={{ display:'flex', gap: 3 }}>
              {['#0001', Y, C, P].map(c => <div key={c} style={{ width: 10, height: 10, background: c, border:`1px solid ${I}22`, borderRadius: 2 }}/>)}
            </div>
            <span>more</span>
          </div>
        </div>
      </div>

      {/* HOLDING NOW — bigger grid */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>★ HOLDING NOW · 14</div>
        <div style={{ fontFamily:'JetBrains Mono', fontSize: 11, opacity: 0.6 }}>view all →</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap: 12, marginBottom: 18, padding:'4px 4px 8px' }}>
        {[
          { cat:'🏀', a:'JORDAN',  p:'$142', d:'+18%', tilt:-1.5, bg:P, fg:'#fff' },
          { cat:'⚡', a:'BASE',    p:'$312', d:'+9.6%',tilt: 1.5, bg:C, fg:I },
          { cat:'🚀', a:'JOBS',    p:'$78',  d:'-2%',  tilt:-2,   bg:Y, fg:I },
          { cat:'🤖', a:'PARTIAL', p:'$64',  d:'+34%', tilt: 2,   bg:'#fff', fg:I },
          { cat:'🎬', a:'WALL-E',  p:'$28',  d:'+22%', tilt:-1.5, bg:P, fg:'#fff' },
          { cat:'🌍', a:'LISBON',  p:'$142', d:'+18%', tilt: 1.5, bg:Y, fg:I },
        ].map((c, i) => (
          <Sticker key={i} bg={c.bg} fg={c.fg} tilt={c.tilt} shadow={4}>
            <Chip bg={c.bg === '#fff' || c.bg === Y ? I : '#fff'} fg={c.bg === '#fff' || c.bg === Y ? Y : I} sm>{c.cat}</Chip>
            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 8, letterSpacing:'-0.03em', lineHeight: 0.95 }}>{c.a}</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 11, marginTop: 6 }}><span>{c.p}</span><span>{c.d}</span></div>
          </Sticker>
        ))}
      </div>

      {/* CREATED BY THEM */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>★ MINTED BY @vitalik · 8</div>
        <div style={{ fontFamily:'JetBrains Mono', fontSize: 11, opacity: 0.6 }}>earned $1,420 in royalties</div>
      </div>
      <div style={{ background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}`, marginBottom: 18 }}>
        <div style={{ display:'grid', gridTemplateColumns:'30px 1.4fr 1.4fr 80px 80px 70px 90px', padding:'8px 14px', fontSize: 9, fontWeight: 800, letterSpacing:'0.12em', textTransform:'uppercase', borderBottom:`2px solid ${I}`, opacity: 0.7 }}>
          <span></span><span>Question</span><span>Their take</span><span style={{ textAlign:'right' }}>Mint</span><span style={{ textAlign:'right' }}>Floor</span><span style={{ textAlign:'right' }}>Flips</span><span style={{ textAlign:'right' }}>Royalty</span>
        </div>
        {[
          { e:'🏀', q:'GOAT basketball?',    t:'JORDAN',    m:'$25',  f:'$142', fl:4, r:'+$622' },
          { e:'⚡', q:'Best L2?',             t:'BASE',      m:'$50',  f:'$312', fl:3, r:'+$418' },
          { e:'🤖', q:'AI by 2030?',         t:'PARTIALLY', m:'$10',  f:'$64',  fl:2, r:'+$214' },
          { e:'🍕', q:'Best burrito in SF?', t:'MISSION',   m:'$5',   f:'$10',  fl:1, r:'+$48' },
        ].map((r, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'30px 1.4fr 1.4fr 80px 80px 70px 90px', padding:'9px 14px', fontSize: 12, alignItems:'center', borderTop: i ? `2px dashed ${I}33` : 'none' }}>
            <span style={{ fontSize: 16 }}>{r.e}</span>
            <span style={{ fontStyle:'italic', opacity: 0.75, fontSize: 11 }}>"{r.q}"</span>
            <span style={{ fontWeight: 900, letterSpacing:'-0.02em' }}>{r.t}</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right', opacity: 0.6 }}>{r.m}</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right', fontWeight: 800 }}>{r.f}</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right' }}>{r.fl}×</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right', fontWeight: 900, color: P }}>{r.r}</span>
          </div>
        ))}
      </div>

      {/* RECENT TRADES */}
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>★ RECENT TRADES · 32 LIFETIME</div>
      <div style={{ background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
        {[
          { d:'2h ago',   k:'TOOK',   q:'best-l2',         t:'BASE',    from:'meme.lord', p:'$312', pnl:null,    bg: C, fg: I },
          { d:'today',    k:'MINTED', q:'goat-pixar',      t:'WALL-E',  from:'—',         p:'$28',  pnl:null,    bg: Y, fg: I },
          { d:'1d ago',   k:'FLIPPED',q:'best-founder',    t:'JOBS',    from:'@degen.42', p:'$78',  pnl:'+$24',  bg: P, fg: '#fff' },
          { d:'3d ago',   k:'TAKEN',  q:'btc-200k',        t:'YES',     from:'hodlfren',  p:'$210', pnl:'+$84 royalty', bg: P, fg: '#fff' },
          { d:'5d ago',   k:'TOOK',   q:'ai-by-2030',      t:'PARTIAL', from:'@degen.42', p:'$64',  pnl:null,    bg: C, fg: I },
        ].map((r, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'70px 80px 1.4fr 1.2fr 80px 90px', padding:'9px 14px', fontSize: 12, alignItems:'center', borderTop: i ? `2px dashed ${I}33` : 'none' }}>
            <span style={{ fontFamily:'JetBrains Mono', fontSize: 11, opacity: 0.7 }}>{r.d}</span>
            <span><Chip bg={r.bg} fg={r.fg} sm>{r.k}</Chip></span>
            <span style={{ fontStyle:'italic', opacity: 0.7, fontSize: 11 }}>"{r.q}"</span>
            <span><b>{r.t}</b> <span style={{ opacity: 0.55, fontSize: 11 }}>· {r.from === '—' ? 'first mint' : `from @${r.from}`}</span></span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right', fontWeight: 800 }}>{r.p}</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right', fontWeight: 900, color: r.pnl ? P : I, opacity: r.pnl ? 1 : 0.4 }}>{r.pnl || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  </Page>
);

/* ---------- 8. Watchlist ---------- */
const Watchlist = () => (
  <Page label="/watchlist">
    <Nav/>
    <div style={{ padding:'20px 26px' }}>
      <div style={{ borderBottom:`2.5px dashed ${I}`, paddingBottom: 12, marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing:'0.18em' }}>★ YOUR WATCHLIST</div>
        <div style={{ fontWeight: 900, fontSize: 32, letterSpacing:'-0.03em', marginTop: 2 }}>Takes you're stalking.</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 14, padding:'4px 4px 8px' }}>
        {[
          { cat:'🏀 SPORTS', q:'GOAT basketball?', a:'JORDAN',  p:'$142', d:'+18%', alert:'⚠ +12% today', tilt:-1.5, bg:P, fg:'#fff' },
          { cat:'⚡ CRYPTO',  q:'Best L2?',         a:'BASE',    p:'$312', d:'+9.6%', alert:'★ price hit your target', tilt:2, bg:C, fg:I },
          { cat:'🤖 AI',      q:'AI by 2030?',     a:'PARTIAL', p:'$64',  d:'-4%',  alert:'', tilt:-2, bg:Y, fg:I },
          { cat:'🎬 CINEMA',  q:'Best Pixar?',     a:'WALL-E',  p:'$28',  d:'+22%', alert:'🔥 spicy mover', tilt:1.5, bg:'#fff', fg:I },
          { cat:'🍕 FOOD',    q:'Best burrito?',   a:'MISSION', p:'$10',  d:'+8%',  alert:'', tilt:-1.5, bg:P, fg:'#fff' },
          { cat:'🚀 FOUND',   q:'Best founder?',   a:'JOBS',    p:'$78',  d:'-2%',  alert:'', tilt:2, bg:C, fg:I },
        ].map((c, i) => (
          <Sticker key={i} bg={c.bg} fg={c.fg} tilt={c.tilt}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <Chip bg={c.bg === '#fff' || c.bg === Y ? I : '#fff'} fg={c.bg === '#fff' || c.bg === Y ? Y : I} sm>{c.cat}</Chip>
              <span style={{ fontSize: 14 }}>⭐</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, opacity: 0.85 }}>"{c.q}"</div>
            <div style={{ fontWeight: 900, fontSize: 26, letterSpacing:'-0.03em', lineHeight: 0.95, marginTop: 2 }}>{c.a}</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 12, marginTop: 6 }}><span>{c.p}</span><span>{c.d}</span></div>
            {c.alert && <div style={{ fontSize: 10, fontWeight: 800, marginTop: 8, padding:'4px 8px', background: c.fg === '#fff' ? 'rgba(255,255,255,0.2)' : Y, color: c.fg === '#fff' ? '#fff' : I, borderRadius: 6 }}>{c.alert}</div>}
          </Sticker>
        ))}
      </div>
    </div>
  </Page>
);

/* ---------- 9. Referrals ---------- */
const Referrals = () => (
  <Page label="/referrals">
    <Nav/>
    <div style={{ padding:'24px 26px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap: 22, alignItems:'start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing:'0.18em' }}>★ BRING YOUR CREW</div>
          <div style={{ fontWeight: 900, fontSize: 56, letterSpacing:'-0.04em', lineHeight: 0.95, marginTop: 6 }}>Refer.<br/><span style={{ color: P }}>Earn.</span> Repeat.</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 14, maxWidth: 460 }}>You earn <b>1% of every flip</b> from anyone you bring. Forever. They get $5 to mint their first take.</div>
        </div>
        <Sticker bg={W} fg={I} tilt={-1.5} shadow={6}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing:'0.14em' }}>YOUR LINK</div>
          <div style={{ fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 16, marginTop: 6, padding:'10px 12px', background: Y, border:`2px solid ${I}`, borderRadius: 8, wordBreak:'break-all' }}>omc.gg/r/0xA1...3F</div>
          <Btn kind="ink" style={{ width:'100%', marginTop: 10 }}>★ COPY LINK</Btn>
        </Sticker>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10, marginTop: 22, padding:'14px 18px', background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
        {[['INVITED', '12'], ['JOINED', '7'], ['THEY MINTED', '24 takes'], ['YOU EARNED', '+$84.30']].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing:'0.1em' }}>{k}</div>
            <div style={{ fontFamily:'JetBrains Mono', fontWeight: 900, fontSize: 18, marginTop: 2, color: k === 'YOU EARNED' ? P : I }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10, marginTop: 22 }}>★ YOUR CREW · 7 ONLINE</div>
      <div style={{ background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
        {[
          { who:'@degen.42',  mint:'best-pixar',    earn:'+$28.40', live:true },
          { who:'meme.lord',  mint:'best-burrito',  earn:'+$8.60',  live:true },
          { who:'jesse.base', mint:'best-l2',       earn:'+$31.20', live:false },
          { who:'hodlfren',   mint:'btc-200k',      earn:'+$12.10', live:true },
        ].map((r, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1.3fr 1.3fr 80px 80px', alignItems:'center', padding:'10px 16px', borderTop: i ? `2px dashed ${I}33` : 'none', fontSize: 12 }}>
            <span><b>@{r.who}</b> {r.live && <Chip bg={C} fg={I} sm>● LIVE</Chip>}</span>
            <span style={{ fontStyle:'italic', opacity: 0.65 }}>last: {r.mint}</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right' }}>2 days</span>
            <span style={{ fontFamily:'JetBrains Mono', textAlign:'right', fontWeight: 900, color: P }}>{r.earn}</span>
          </div>
        ))}
      </div>
    </div>
  </Page>
);

/* ---------- 10. Pool detail ---------- */
const PoolDetail = () => (
  <Page label="/pools/[id]">
    <Nav active="pools"/>
    <div style={{ padding:'20px 26px', display:'grid', gridTemplateColumns:'1.5fr 1fr', gap: 22 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing:'0.18em', marginBottom: 6 }}>★ POOL #14 · 12 collectors</div>
        <Sticker bg={C} fg={I} tilt={-2} shadow={6} style={{ padding:'24px 26px' }}>
          <Chip bg={I} fg={C}>⚡ CRYPTO</Chip>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, fontStyle:'italic' }}>"Will BTC hit $200k by Q3 2026?"</div>
          <div style={{ fontWeight: 900, fontSize: 72, letterSpacing:'-0.04em', lineHeight: 0.9, marginTop: 6 }}>YES.</div>
          <div style={{ fontFamily:'JetBrains Mono', fontWeight: 800, marginTop: 14, fontSize: 14 }}>opened by @vitalik.eth · 8 days ago</div>
        </Sticker>

        <div style={{ marginTop: 16, padding:'14px 18px', background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <span style={{ fontWeight: 900, fontSize: 14 }}>💰 POOL FUNDING</span>
            <span style={{ fontFamily:'JetBrains Mono', fontWeight: 900, fontSize: 18 }}>$1,847 / $2,500</span>
          </div>
          <div style={{ height: 14, background: I, borderRadius: 999, position:'relative', marginTop: 10 }}>
            <div style={{ position:'absolute', left: 0, width:'74%', top: 0, bottom: 0, background: P, borderRadius: 999 }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 11, marginTop: 6 }}>
            <span>74% funded</span><span>$653 to go</span><span style={{ color: P }}>closes in 3d 14h</span>
          </div>
        </div>
      </div>
      <div>
        <Sticker bg={W} fg={I} tilt={-1}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing:'0.14em', marginBottom: 6 }}>★ JOIN THE POOL</div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing:'0.1em', marginTop: 8 }}>YOUR STAKE</div>
          <div style={{ fontFamily:'JetBrains Mono', fontWeight: 900, fontSize: 32, marginTop: 4 }}>$50</div>
          <div style={{ height: 8, background: I, borderRadius: 999, position:'relative', marginTop: 8 }}>
            <div style={{ position:'absolute', left: 0, width:'33%', top: 0, bottom: 0, background: C, borderRadius: 999 }}/>
            <div style={{ position:'absolute', left:'33%', top:'50%', width: 18, height: 18, transform:'translate(-50%, -50%)', background: Y, border:`2.5px solid ${I}`, borderRadius:'50%', boxShadow:`2px 2px 0 ${I}` }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontSize: 10, marginTop: 4, opacity: 0.6 }}>
            <span>$5</span><span>$50</span><span>$500</span>
          </div>
          <div style={{ marginTop: 12, padding:'10px 12px', background: Y, border:`2px solid ${I}`, borderRadius: 10, fontSize: 11, fontWeight: 700, lineHeight: 1.5 }}>
            ★ your share: <b>2.7%</b><br/>★ earn 2.7% of every flip — forever
          </div>
          <Btn kind="pop" style={{ width:'100%', marginTop: 12 }}>★ JOIN POOL · $50</Btn>
        </Sticker>
        <div style={{ marginTop: 14, fontWeight: 900, fontSize: 13, marginBottom: 8 }}>★ CONTRIBUTORS</div>
        <div style={{ background: W, border:`2.5px solid ${I}`, borderRadius: 12, boxShadow:`4px 4px 0 ${I}` }}>
          {[
            { who:'@vitalik.eth', stake:'$500', share:'27%' },
            { who:'jesse.base',   stake:'$300', share:'16%' },
            { who:'prag.base',    stake:'$200', share:'11%' },
            { who:'@degen.42',    stake:'$100', share:'5%' },
          ].map((r, i) => (
            <div key={r.who} style={{ display:'grid', gridTemplateColumns:'1fr 70px 50px', padding:'8px 14px', fontSize: 12, alignItems:'center', borderTop: i ? `2px dashed ${I}33` : 'none' }}>
              <span><b>@{r.who}</b></span>
              <span style={{ fontFamily:'JetBrains Mono', textAlign:'right' }}>{r.stake}</span>
              <span style={{ fontFamily:'JetBrains Mono', textAlign:'right', fontWeight: 800 }}>{r.share}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Page>
);

/* ---------- 11. Mobile (feed) ---------- */
const Mobile = () => (
  <Page label="MOBILE / FEED" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ width: 320, height: 640, background: Y, color: I, border:`3px solid ${I}`, borderRadius: 32, padding: 12, boxShadow:`8px 8px 0 ${P}`, position:'relative' }}>
      <div style={{ width: 90, height: 20, background: I, margin:'0 auto 10px', borderRadius:'0 0 14px 14px' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 8px 8px' }}>
        <span style={{ fontWeight: 900, fontSize: 18, letterSpacing:'-0.03em' }}>OMC ★</span>
        <span style={{ fontFamily:'JetBrains Mono', fontSize: 10, fontWeight: 700 }}>4🔥 · $1,247</span>
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing:'0.18em', marginBottom: 8 }}>★ HOT RIGHT NOW</div>
      <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
        {[
          { cat:'🏀 SPORTS', q:'GOAT basketball?', a:'JORDAN', p:'$142', d:'+18%', bg:P,   fg:'#fff', tilt:-1.5 },
          { cat:'⚡ CRYPTO',  q:'Best L2?',         a:'BASE',   p:'$312', d:'+9.6%', bg:C,  fg:I,      tilt: 1.5 },
          { cat:'🎬 CINEMA',  q:'GOAT Pixar?',      a:'WALL-E', p:'$28',  d:'NEW',  bg:'#fff', fg:I,   tilt:-1.5 },
        ].map((c, i) => (
          <Sticker key={i} bg={c.bg} fg={c.fg} tilt={c.tilt} shadow={4}>
            <Chip bg={c.bg === '#fff' ? Y : '#fff'} fg={I} sm>{c.cat}</Chip>
            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 3, opacity: 0.85 }}>"{c.q}"</div>
            <div style={{ fontWeight: 900, fontSize: 26, lineHeight: 0.95, marginTop: 2, letterSpacing:'-0.03em' }}>{c.a}</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'JetBrains Mono', fontWeight: 800, fontSize: 12, marginTop: 4 }}><span>{c.p} · {c.d}</span><b>TAKE IT →</b></div>
          </Sticker>
        ))}
      </div>
      <div style={{ position:'absolute', bottom: 14, left: 14, right: 14, background: I, display:'flex', borderRadius: 999, padding: 4 }}>
        {[['HOT', true],['ROOM',false],['★+',false],['HALL',false],['ME',false]].map(([t, on], i) => (
          <div key={i} style={{ flex: 1, textAlign:'center', padding:'7px 0', fontSize: 10, fontWeight: 900, color: t === '★+' ? I : (on ? I : Y), background: t === '★+' ? P : (on ? Y : 'transparent'), borderRadius: 999 }}>{t}</div>
        ))}
      </div>
    </div>
  </Page>
);

/* ---------- Mount in canvas ---------- */
const { useState } = React;

const Canvas = () => {
  const screens = [
    { id:'landing',     label:'1 · /  · Landing / Hot Wall',          w: 1120, h: 760, Cmp: Landing },
    { id:'marketplace', label:'2 · /marketplace · The Floor',         w: 1120, h: 760, Cmp: Marketplace },
    { id:'detail',      label:'3 · /opinions/[id] · Detail + Chart + Slip', w: 1120, h: 940, Cmp: OpinionDetail },
    { id:'create',      label:'4 · /create · Mint a Take',            w: 1120, h: 620, Cmp: Create },
    { id:'portfolio',   label:'5 · /portfolio · Your Room',           w: 1120, h: 700, Cmp: Portfolio },
    { id:'leaderboard', label:'6 · /leaderboard · Hall of Takes',     w: 1120, h: 700, Cmp: Leaderboard },
    { id:'profile',     label:'7 · /profile/[address] · Full collector data', w: 1180, h: 1380, Cmp: Profile },
    { id:'watchlist',   label:'8 · /watchlist · Saved Takes',         w: 1120, h: 660, Cmp: Watchlist },
    { id:'referrals',   label:'9 · /referrals · Bring your crew',     w: 1120, h: 700, Cmp: Referrals },
    { id:'pool',        label:'10 · /pools/[id] · Pool detail',       w: 1120, h: 720, Cmp: PoolDetail },
    { id:'mobile',      label:'11 · Mobile feed',                     w: 360,  h: 720, Cmp: Mobile },
  ];
  const [focus, setFocus] = useState(null);
  if (focus) {
    const s = screens.find(x => x.id === focus);
    return (
      <div style={{ position:'fixed', inset: 0, background:'#1a1a1a', overflow:'auto', padding: 24, zIndex: 999 }}>
        <div style={{ position:'sticky', top: 0, background:'#1a1a1a', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 8px 16px', zIndex: 2 }}>
          <span style={{ color:'#fff', fontFamily:'JetBrains Mono', fontWeight: 700 }}>{s.label}</span>
          <button onClick={() => setFocus(null)} style={{ background: Y, color: I, border:`2.5px solid ${I}`, borderRadius: 999, padding:'8px 18px', fontWeight: 900, fontSize: 12, cursor:'pointer' }}>← back</button>
        </div>
        <div style={{ width: s.w, height: s.h, margin:'0 auto', boxShadow:'0 30px 80px rgba(0,0,0,0.5)' }}>
          <s.Cmp/>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background:'#1a1a1a', minHeight:'100vh', padding:'32px 36px', color:'#fff', fontFamily:'Inter Tight, sans-serif' }}>
      <div style={{ maxWidth: 1400, margin:'0 auto', marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing:'0.22em', opacity: 0.6, textTransform:'uppercase' }}>OMC · Poster Arcade · Full app redesign</div>
        <div style={{ fontWeight: 900, fontSize: 44, letterSpacing:'-0.03em', marginTop: 4 }}>11 screens. One system.</div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6, maxWidth: 640 }}>Click any screen to view at full size. See <code style={{ background:'#333', padding:'2px 6px', borderRadius: 4 }}>DESIGN_SYSTEM.md</code> for tokens, <code style={{ background:'#333', padding:'2px 6px', borderRadius: 4 }}>SCREENS.md</code> for per-route intent, and <code style={{ background:'#333', padding:'2px 6px', borderRadius: 4 }}>tailwind.config.ts</code> + <code style={{ background:'#333', padding:'2px 6px', borderRadius: 4 }}>globals.css</code> for drop-in code.</div>
      </div>
      <div style={{ maxWidth: 1400, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {screens.map(s => (
          <div key={s.id} onClick={() => setFocus(s.id)} style={{ background:'#222', border:'1px solid #333', borderRadius: 12, padding: 14, cursor:'pointer', transition:'transform 200ms' }}
               onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
               onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ aspectRatio: s.w / s.h, background: Y, borderRadius: 8, overflow:'hidden', position:'relative' }}>
              <div style={{ position:'absolute', inset: 0, transform:`scale(${360 / s.w})`, transformOrigin:'top left', width: s.w, height: s.h }}>
                <s.Cmp/>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 10 }}>{s.label}</div>
            <div style={{ fontSize: 10, color:'#999', fontFamily:'JetBrains Mono', marginTop: 2 }}>{s.w} × {s.h}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Canvas/>);
