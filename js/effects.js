/* Hiệu ứng nền mạng lưới + chuột (di chuyển & chạm/click) */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const mouse = { x: -999, y: -999 };

  /* ---- 1. Nền: hạt đỏ nối nhau thành mạng, phản ứng với chuột ---- */
  const bg = document.getElementById('bg'), b = bg.getContext('2d');
  let W = 0, H = 0, P = [];
  function size() {
    W = bg.width = innerWidth; H = bg.height = innerHeight;
    const n = Math.min(110, Math.floor(W * H / 14000));
    P = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.4 + .6
    }));
  }
  function drawBg() {
    b.clearRect(0, 0, W, H);
    for (const p of P) {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d > 0 && d < 110) { p.x += dx / d * 1.3; p.y += dy / d * 1.3; }
      b.fillStyle = 'rgba(255,60,75,.85)';
      b.beginPath(); b.arc(p.x, p.y, p.r, 0, 6.283); b.fill();
    }
    b.lineWidth = 1;
    for (let i = 0; i < P.length; i++) {
      for (let j = i + 1; j < P.length; j++) {
        const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
        if (d < 130) {
          b.strokeStyle = `rgba(255,42,61,${(1 - d / 130) * .35})`;
          b.beginPath(); b.moveTo(P[i].x, P[i].y); b.lineTo(P[j].x, P[j].y); b.stroke();
        }
      }
      const dm = Math.hypot(P[i].x - mouse.x, P[i].y - mouse.y);
      if (dm < 170) {
        b.strokeStyle = `rgba(255,140,150,${(1 - dm / 170) * .6})`;
        b.beginPath(); b.moveTo(P[i].x, P[i].y); b.lineTo(mouse.x, mouse.y); b.stroke();
      }
    }
    if (!reduce) requestAnimationFrame(drawBg);
  }
  addEventListener('resize', () => { size(); if (reduce) drawBg(); });
  size(); drawBg();

  if (reduce) return; // người dùng tắt chuyển động -> bỏ hiệu ứng chuột

  /* ---- 2. Canvas hiệu ứng: vệt tia lửa khi di chuột + sóng xung kích khi click ---- */
  const fx = document.createElement('canvas'); fx.id = 'fx'; document.body.appendChild(fx);
  const f = fx.getContext('2d');
  const fit = () => { fx.width = innerWidth; fx.height = innerHeight; };
  fit(); addEventListener('resize', fit);
  const sparks = [], rings = [];
  const cols = ['255,42,61', '255,90,60', '255,255,255', '255,140,150'];
  function spark(x, y, speed, life) {
    const a = Math.random() * 6.283, s = Math.random() * speed;
    sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, r: Math.random() * 2 + 1, c: cols[(Math.random() * cols.length) | 0] });
  }
  function burst(x, y) {
    rings.push({ x, y, r: 6, max: 90, life: 1 });
    setTimeout(() => rings.push({ x, y, r: 4, max: 55, life: 1 }), 90);
    for (let i = 0; i < 22; i++) spark(x, y, 5, 0.7 + Math.random() * .4);
  }
  let lx = 0, ly = 0;
  addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (Math.hypot(e.clientX - lx, e.clientY - ly) > 8) {
      lx = e.clientX; ly = e.clientY;
      for (let i = 0; i < 2; i++) spark(lx, ly, 1.2, 0.55);
    }
  });
  addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
  addEventListener('pointerdown', e => burst(e.clientX, e.clientY));
  let last = performance.now();
  (function loop(t) {
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    f.clearRect(0, 0, fx.width, fx.height);
    f.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.life -= dt;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      s.x += s.vx; s.y += s.vy; s.vx *= .95; s.vy *= .95;
      const a = s.life / s.max;
      f.fillStyle = `rgba(${s.c},${a})`;
      f.beginPath(); f.arc(s.x, s.y, s.r * a + .3, 0, 6.283); f.fill();
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.r += (r.max - r.r) * 6 * dt + 40 * dt; r.life -= dt * 2.2;
      if (r.life <= 0) { rings.splice(i, 1); continue; }
      f.strokeStyle = `rgba(255,42,61,${r.life})`; f.lineWidth = 2;
      f.beginPath(); f.arc(r.x, r.y, r.r, 0, 6.283); f.stroke();
    }
    f.globalCompositeOperation = 'source-over';
    requestAnimationFrame(loop);
  })(last);

  /* ---- 3. Con trỏ tùy chỉnh (chấm + vòng) chỉ cho thiết bị có chuột ---- */
  if (fine) {
    document.documentElement.classList.add('has-cursor');
    const dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'c-dot'; ring.className = 'c-ring';
    document.body.append(ring, dot);
    let rx = innerWidth / 2, ry = innerHeight / 2, mx = rx, my = ry;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
    (function follow() {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(follow);
    })();
    const hotSel = 'a,button,input,textarea,.app,.prj,.soc';
    addEventListener('mouseover', e => ring.classList.toggle('hot', !!e.target.closest(hotSel)));
    addEventListener('mousedown', () => ring.classList.add('down'));
    addEventListener('mouseup', () => ring.classList.remove('down'));
    document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = 1; });
  }

  /* ---- 4. Đèn rọi đỏ trong thẻ theo vị trí chuột ---- */
  addEventListener('mousemove', e => {
    const c = e.target.closest && e.target.closest('.glass,.app');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--x', (e.clientX - r.left) + 'px');
    c.style.setProperty('--y', (e.clientY - r.top) + 'px');
  });
})();
