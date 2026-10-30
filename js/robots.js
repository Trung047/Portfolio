/* Robot nhỏ màu xanh dương nhạt chạy quanh trang */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SVG = `<svg viewBox="0 0 48 64" fill="none">
    <g class="torso">
      <line x1="24" y1="3" x2="24" y2="10" stroke="#7cc9ee" stroke-width="2" stroke-linecap="round"/>
      <circle cx="24" cy="3.5" r="2.6" fill="#e0f7ff"/>
      <rect x="3" y="16" width="4" height="8" rx="2" fill="#6bb8e0"/><rect x="41" y="16" width="4" height="8" rx="2" fill="#6bb8e0"/>
      <rect x="7" y="9" width="34" height="24" rx="9" fill="#a5e0fa" stroke="#6bb8e0" stroke-width="1.5"/>
      <rect x="11" y="14" width="26" height="14" rx="6" fill="#0b1a2a"/>
      <circle class="eye" cx="19" cy="21" r="2.8" fill="#7df9ff"/><circle class="eye" cx="29" cy="21" r="2.8" fill="#7df9ff"/>
      <rect x="12" y="34" width="24" height="16" rx="6" fill="#a5e0fa" stroke="#6bb8e0" stroke-width="1.5"/>
      <circle cx="24" cy="42" r="3.2" fill="#e0f7ff"/><circle cx="24" cy="42" r="1.4" fill="#38bdf8"/>
      <rect class="arm armL" x="4" y="35" width="6" height="14" rx="3" fill="#8fd3f3" stroke="#6bb8e0" stroke-width="1"/>
      <rect class="arm armR" x="38" y="35" width="6" height="14" rx="3" fill="#8fd3f3" stroke="#6bb8e0" stroke-width="1"/>
    </g>
    <rect class="leg legL" x="14" y="49" width="8" height="13" rx="3.5" fill="#8fd3f3" stroke="#6bb8e0" stroke-width="1"/>
    <rect class="leg legR" x="26" y="49" width="8" height="13" rx="3.5" fill="#8fd3f3" stroke="#6bb8e0" stroke-width="1"/>
  </svg>`;

  const layer = document.createElement('div'); layer.id = 'bots'; document.body.appendChild(layer);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const count = innerWidth < 640 ? 3 : 5;
  const bots = [];

  for (let i = 0; i < count; i++) {
    const s = rnd(.85, 1.15), w = 44 * s, h = 58 * s;
    const el = document.createElement('div'); el.className = 'bot walk';
    el.style.width = w + 'px'; el.style.height = h + 'px';
    el.innerHTML = `<div class="bot-in"><div class="bot-flip">${SVG}</div></div>`;
    layer.appendChild(el);
    const bot = { el, flip: el.querySelector('.bot-flip'), w, h, x: rnd(0, innerWidth - w), y: rnd(90, innerHeight - h - 10), sp: rnd(70, 120), face: 1, mode: 'walk', wait: 0, run: false };
    pick(bot); bots.push(bot);
  }

  function pick(b) { b.tx = rnd(10, Math.max(20, innerWidth - b.w - 10)); b.ty = rnd(80, Math.max(100, innerHeight - b.h - 10)); }
  function mode(b, m) { b.mode = m; b.el.classList.toggle('walk', m === 'walk'); b.el.classList.toggle('idle', m === 'idle'); }

  /* Click/chạm: robot gần đó nhảy lên rồi chạy tới chỗ bạn bấm */
  addEventListener('pointerdown', e => {
    for (const b of bots) {
      if (Math.hypot(b.x + b.w / 2 - e.clientX, b.y + b.h / 2 - e.clientY) < 420) {
        b.tx = Math.min(innerWidth - b.w, Math.max(0, e.clientX - b.w / 2 + rnd(-30, 30)));
        b.ty = Math.min(innerHeight - b.h, Math.max(0, e.clientY - b.h / 2 + rnd(-20, 20)));
        b.run = true; mode(b, 'walk');
        b.el.classList.remove('hop'); void b.el.offsetWidth; b.el.classList.add('hop');
        setTimeout(() => b.el.classList.remove('hop'), 520);
      }
    }
  });

  addEventListener('resize', () => bots.forEach(b => { b.x = Math.min(b.x, innerWidth - b.w); b.y = Math.min(b.y, innerHeight - b.h); pick(b); }));

  let last = performance.now();
  (function tick(t) {
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    for (const b of bots) {
      if (b.mode === 'walk') {
        const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy);
        if (d < 6) { b.run = false; mode(b, 'idle'); b.wait = rnd(.7, 2.4); }
        else {
          const v = b.sp * (b.run ? 1.8 : 1);
          b.x += dx / d * v * dt; b.y += dy / d * v * dt;
          if (Math.abs(dx) > 4) b.face = dx > 0 ? 1 : -1;
        }
      } else {
        b.wait -= dt;
        if (b.wait <= 0) { pick(b); mode(b, 'walk'); }
      }
      b.el.style.transform = `translate(${b.x}px,${b.y}px)`;
      b.flip.style.transform = `scaleX(${b.face})`;
    }
    requestAnimationFrame(tick);
  })(last);
})();
