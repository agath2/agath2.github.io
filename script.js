// Project filter: each card lists its categories in data-category (space-separated).
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.card');

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    const selected = btn.dataset.filter;

    filters.forEach(b => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active);
    });

    cards.forEach(card => {
      const categories = card.dataset.category.split(' ');
      card.classList.toggle('hidden', selected !== 'all' && !categories.includes(selected));
    });
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

// Topographic rings: concentric rings distorted by three layered sine waves,
// reacting to the cursor (x shifts frequency, y shifts amplitude).
(() => {
  const canvas = document.getElementById('rings');
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const RINGS = 10, SPACING = 62, SQUASH = 0.5, SEGMENTS = 200;
  let w, h, dpr, t = 0, running = true, colors;
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    const text = s.getPropertyValue('--text').trim();
    const accent = s.getPropertyValue('--ring-accent').trim();
    colors = { accent, mid: text, base: text };
  };

  const resize = () => {
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(1, w / 1300);            // shrink rings on narrow screens
    const lobes = 0.5 + mouse.x * 0.9;              // horizontal: strength of the finer lobes
    const amp = 0.6 + mouse.y * 0.4;                // vertical: how strongly rings distort
    for (let i = 1; i <= RINGS; i++) {
      const r = i * SPACING * scale;
      const tier = i % 5 === 0 ? 'accent' : i % 2 === 0 ? 'mid' : 'base';
      // each ring drifts off-center and tilts, so neighbours overlap and cross like scribbles
      const ox = Math.sin(i * 0.9) * 48 * scale * amp;
      const oy = Math.cos(i * 1.3) * 26 * scale * amp;
      const tilt = Math.sin(i * 0.5) * 0.25;
      ctx.beginPath();
      for (let s = 0; s <= SEGMENTS; s++) {
        const a = (s / SEGMENTS) * Math.PI * 2;
        // standing waves: each lobe grows and shrinks in place (no travelling around the ring)
        const d = r * amp * (
          0.22 * Math.sin(a + i * 1.7)       * Math.sin(t * 0.9 + i * 0.7) +
          0.18 * Math.sin(2 * a + i * 2.3)   * Math.sin(t * 1.3 + i * 0.4) +
          0.11 * lobes * Math.sin(3 * a + i * 0.9) * Math.sin(t * 0.7 + i * 1.1)
        );
        const rr = r + d;
        const px = Math.cos(a + tilt) * rr;
        const py = Math.sin(a + tilt) * rr * SQUASH;
        const x = cx + ox + px, y = cy + oy + py;
        s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = colors[tier];
      ctx.globalAlpha = tier === 'accent' ? 0.18 : tier === 'mid' ? 0.08 : 0.05;
      ctx.lineWidth = tier === 'accent' ? 1.2 : 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const tick = () => {
    if (!running) return;
    mouse.x += (mouse.tx - mouse.x) * 0.03;
    mouse.y += (mouse.ty - mouse.y) * 0.03;
    t += 0.008;
    draw();
    requestAnimationFrame(tick);
  };

  const start = () => { if (!running && !reduced.matches) { running = true; tick(); } };

  readColors();
  resize();
  addEventListener('resize', resize);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readColors(); draw(); });
  addEventListener('mousemove', e => { mouse.tx = e.clientX / innerWidth; mouse.ty = e.clientY / innerHeight; });

  // Pause when the hero is off-screen; draw once (no animation) for reduced motion.
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) start(); else running = false;
  }).observe(document.querySelector('.hero'));

  if (reduced.matches) { running = false; draw(); } else { tick(); }
})();
