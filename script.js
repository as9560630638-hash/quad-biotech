/* ============================================================
   CAPSOFT HEALTHCARE v3 — script.js
   Particles | Repelling Orbs | Cursor Trail | Navbar
   Scroll Reveal | Stat Counters | 3D Tilt | Modal
   Carousel | Table | Coverflow | Drag Badge
   ============================================================ */

/* ── Particle network — breathing, mouse-repel, connected lines ─ */
(function initParticles() {
  const c = document.getElementById('ptc');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W = 0, H = 0;
  const REPEL = 140, LINK = 120;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* count scales with viewport area */
  const COUNT = Math.min(90, Math.floor(window.innerWidth * window.innerHeight / 18000));
  const pts = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .42,
    vy: (Math.random() - .5) * .42,
    r:  Math.random() * 1.9 + .5,
    ph: Math.random() * Math.PI * 2,
  }));

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  (function draw(ts = 0) {
    ctx.clearRect(0, 0, W, H);

    pts.forEach(p => {
      /* drift + edge wrap */
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;

      /* mouse-repel */
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < REPEL * REPEL && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const f = (1 - d / REPEL) * 3.2;
        p.x += (dx / d) * f * 1.6;
        p.y += (dy / d) * f * 1.6;
      }

      /* breathing opacity (sine wave on phase) */
      const a = .3 + .26 * Math.sin(ts / 1400 + p.ph);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(204,239,229,${a})`;
      ctx.fill();
    });

    /* connect nearby particles with fading mint lines */
    for (let i = 0; i < pts.length - 1; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(42,122,104,${(1 - d / LINK) * .28})`;
          ctx.lineWidth = .8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  })();
})();

/* ── Spring cursor (dot + ring with physics) ─────────────── */
(function initSpringCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = Object.assign(document.createElement('div'), { className: 'cs-dot'  });
  const ring = Object.assign(document.createElement('div'), { className: 'cs-ring' });
  document.body.append(dot, ring);
  document.body.classList.add('custom-cursor');

  let mx = -400, my = -400;
  let rx = -400, ry = -400;
  let vx = 0,   vy = 0;
  const STIFF = 0.14, DAMP = 0.72;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mousedown', () => ring.classList.add('cs-ring--click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('cs-ring--click'));
  document.addEventListener('mouseover', e => {
    const hit = e.target.closest('a, button, .sl-card, .stat, .qcard, .rcard, .c3d, .mt-wrap, .vcard-wrap, .pcard, input, textarea, select');
    ring.classList.toggle('cs-ring--hover', Boolean(hit));
  });

  (function tick() {
    vx += (mx - rx) * STIFF; vy += (my - ry) * STIFF;
    vx *= DAMP; vy *= DAMP;
    rx += vx; ry += vy;
    dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  })();
})();


/* ── Mouse-repelling orbs ────────────────────────────────── */
(function initRepelOrbs() {
  const defs = [
    { id: 'orb0', hx: 0.14, hy: 0.28 },
    { id: 'orb1', hx: 0.78, hy: 0.55 },
    { id: 'orb2', hx: 0.48, hy: 0.82 },
    { id: 'orb3', hx: 0.86, hy: 0.18 },
  ];

  const orbs = defs.map(d => {
    const el = document.getElementById(d.id);
    if (!el) return null;
    const x = d.hx * window.innerWidth;
    const y = d.hy * window.innerHeight;
    return { el, hx: d.hx, hy: d.hy, x, y, vx: 0, vy: 0 };
  }).filter(Boolean);

  if (!orbs.length) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  const REPEL_R = 380, REPEL_S = 3.2, DAMP = 0.87, SPRING = 0.03;

  (function loop() {
    const W = window.innerWidth, H = window.innerHeight;
    orbs.forEach(o => {
      const homeX = o.hx * W, homeY = o.hy * H;
      const dx = o.x - mx, dy = o.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < REPEL_R) {
        const f = ((REPEL_R - dist) / REPEL_R) * REPEL_S;
        o.vx += (dx / dist) * f;
        o.vy += (dy / dist) * f;
      }
      o.vx += (homeX - o.x) * SPRING;
      o.vy += (homeY - o.y) * SPRING;
      o.vx *= DAMP; o.vy *= DAMP;
      o.x += o.vx; o.y += o.vy;
      const ow = o.el.offsetWidth / 2, oh = o.el.offsetHeight / 2;
      o.el.style.transform = `translate(${(o.x - ow).toFixed(1)}px,${(o.y - oh).toFixed(1)}px)`;
    });
    requestAnimationFrame(loop);
  })();
})();

/* ── Navbar hamburger ────────────────────────────────────── */
(function initNav() {
  const ham  = document.getElementById('ham');
  const menu = document.getElementById('navMenu');
  if (!ham || !menu) return;

  ham.addEventListener('click', () => {
    menu.classList.toggle('open');
    ham.setAttribute('aria-expanded', menu.classList.contains('open'));
  });

  menu.querySelectorAll('.ni').forEach(ni => {
    const link = ni.querySelector('.nl');
    if (!link || !ni.querySelector('.dd')) return;
    link.addEventListener('click', e => {
      if (window.innerWidth <= 900) { e.preventDefault(); ni.classList.toggle('open'); }
    });
  });

  document.addEventListener('click', e => {
    if (!ham.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('open');
  });
})();

/* ── Scroll progress bar at top of viewport ──────────────── */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  function update() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? window.scrollY / h : 0;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ── Button ripple on click ──────────────────────────────── */
(function initRipple() {
  const sel = '.btn, .nav-cta, .sl-cta, .sbtn, .tbl-sbtn, .msub, .f-btn';
  document.addEventListener('click', e => {
    const btn = e.target.closest(sel);
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - r.left) + 'px';
    ripple.style.top  = (e.clientY - r.top)  + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
})();


/* ── Auto-tag content elements for scroll reveal ─────────── */
(function autoTagReveal() {
  /* Section-level reveal */
  document.querySelectorAll('section.sec, section.hero, section.vid-sec, section.bio-sec, section.fac-sec, section.ther-sec, section.qual-sec, section.prod-sec, section.dir-sec, section.rev-sec, section.seo-sec, section.cert-sec, section.inner-hero, section.vals-sec, section.about-sec, section.port-sec, section.ing-sec').forEach(sec => {
    if (!sec.classList.contains('hero')) sec.classList.add('sec-rv');
  });

  /* Inline / content reveal */
  const sel = [
    '.h1','.h2','.h3',
    '.tag','.lead','.about-lead','.vid-head','.vid-sub',
    '.sl-wrap','.qcard','.c3d-par','.stat','.pcard','.cbadge',
    '.rcard','.rev-sum',
    '.sgb','.t-pill','.ptg','.cf-img','.adv-item',
    '.stat-chip','.drag-badge',
    '.chart-wrap','.ing-tbl','.tbl-ctrl','.pagination',
    '.vid-wrap','.iso-panel','.spc','.seo-h','.seo-h2','.seo-p','.seo-li',
    '.fc','.footer-bar',
    '.dir-txt .mp','.dir-txt .signoff',
    '.bio-cta','.fac-cta','.port-p','.port-banner'
  ].join(',');

  document.querySelectorAll(sel).forEach(el => {
    if (!el.classList.contains('rv') && !el.classList.contains('sec-rv')) el.classList.add('rv');
  });

  /* Images scale-in */
  document.querySelectorAll('.sg-2col img, .port-banner img, .orbit-frame img, .pcard img, .cf-img')
    .forEach(img => { if (!img.classList.contains('img-rv')) img.classList.add('img-rv'); });

  /* Stagger children within grids */
  document.querySelectorAll('.vals-grid, .bio-grid, .qual-grid, .stats-row, .pills-wrap, .port-tags, .rev-cards, .certs-row, .seo-list, .adv-grid, .sg-bullets, .footer-g').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      const delay = Math.min(i * 55, 440);
      if (!child.style.transitionDelay) child.style.transitionDelay = delay + 'ms';
    });
  });
})();

/* ── Scroll reveal observer ──────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.rv, .sec-rv, .img-rv');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── Stat counter animation (0 → target) ────────────────── */
(function initStatCounters() {
  const els = document.querySelectorAll('.stat__n[data-count]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 2200;
      const start = performance.now();
      el.classList.add('counting');

      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        /* ease-out cubic */
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          el.classList.remove('counting');
        }
      })(start);

      io.unobserve(el);
    });
  }, { threshold: 0.6 });

  /* start at 0 so they're blank until visible */
  els.forEach(el => { el.textContent = '0'; io.observe(el); });
})();

/* ── 3D smooth-tilt for all card types ───────────────────── */
(function initTilt() {
  /* sl-wrap → tilt the inner sl-card */
  document.querySelectorAll('.sl-wrap').forEach(wrap => {
    const card = wrap.querySelector('.sl-card');
    if (!card) return;
    wrap.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform =
        `perspective(1000px) rotateY(${(x * 20).toFixed(2)}deg) rotateX(${(-y * 20).toFixed(2)}deg) translateZ(8px)`;
    });
    wrap.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* stat cards */
  document.querySelectorAll('.stat').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform =
        `perspective(800px) rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 14).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* quality + review cards */
  document.querySelectorAll('.qcard, .rcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform =
        `perspective(700px) rotateY(${(x * 12).toFixed(2)}deg) rotateX(${(-y * 12).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ── Enquiry Modal ───────────────────────────────────────── */
function openModal(interest) {
  const bg = document.getElementById('modalBg');
  if (!bg) return;
  bg.classList.add('on');
  document.body.style.overflow = 'hidden';
  if (interest) { const f = document.getElementById('modalInterest'); if (f) f.value = interest; }
}

function closeModal() {
  const bg = document.getElementById('modalBg');
  if (!bg) return;
  bg.classList.remove('on');
  document.body.style.overflow = '';
}

document.addEventListener('click', e => {
  const bg = document.getElementById('modalBg');
  if (bg && e.target === bg) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

async function submitForm(form, successMsg) {
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn ? btn.textContent : '';
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form),
    });
    if (!res.ok) throw new Error('Submit failed: ' + res.status);
    form.reset();
    alert(successMsg);
  } catch (err) {
    alert('Could not send right now. Please call us directly: +91-8091920250');
    console.error(err);
  } finally {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}

function handleEnquiry(e) {
  e.preventDefault();
  closeModal();
  submitForm(e.target, 'Thank you! Our team will get back to you within 24 hours.');
  return false;
}

function handleFooterForm(e) {
  e.preventDefault();
  submitForm(e.target, 'Message sent. We will contact you shortly.');
  return false;
}

/* ── Draggable badge ─────────────────────────────────────── */
(function initDragBadge() {
  const badge = document.getElementById('dragBadge');
  if (!badge) return;
  let dragging = false, ox = 0, oy = 0;

  badge.addEventListener('mousedown', e => {
    dragging = true;
    const r = badge.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    badge.style.position = 'fixed';
    badge.style.zIndex   = '9999';
    badge.style.cursor   = 'grabbing';
    badge.style.right    = 'auto';
    badge.style.bottom   = 'auto';
    badge.style.left     = r.left + 'px';
    badge.style.top      = r.top  + 'px';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    badge.style.left = (e.clientX - ox) + 'px';
    badge.style.top  = (e.clientY - oy) + 'px';
  });
  document.addEventListener('mouseup', () => { if (dragging) { dragging = false; badge.style.cursor = 'grab'; } });

  badge.addEventListener('touchstart', e => {
    const t = e.touches[0];
    dragging = true;
    const r = badge.getBoundingClientRect();
    ox = t.clientX - r.left; oy = t.clientY - r.top;
    badge.style.position = 'fixed'; badge.style.zIndex = '9999';
    badge.style.right = 'auto'; badge.style.bottom = 'auto';
    badge.style.left = r.left + 'px'; badge.style.top = r.top + 'px';
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const t = e.touches[0];
    badge.style.left = (t.clientX - ox) + 'px';
    badge.style.top  = (t.clientY - oy) + 'px';
  }, { passive: true });
  document.addEventListener('touchend', () => { dragging = false; });
})();

/* ── Product marquee — infinite loop, pause on hover, 3D tilt ── */
(function initMarquee() {
  const track = document.getElementById('prodTrack');
  if (!track) return;

  /* Duplicate original set so translateX(-50%) loops seamlessly */
  const originals = Array.from(track.children);
  originals.forEach(el => track.appendChild(el.cloneNode(true)));

  /* Apply smooth JS 3D tilt to every pcard (originals + clones) */
  track.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform =
        `perspective(900px) rotateY(${(x * 16).toFixed(1)}deg) rotateX(${(-y * 16).toFixed(1)}deg) translateZ(14px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ── Ingredients table search + pagination ───────────────── */
(function initTable() {
  const tbl    = document.getElementById('ingTable');
  const search = document.getElementById('tblSearch');
  const pgWrap = document.getElementById('pagination');
  if (!tbl) return;

  const ROWS_PER_PAGE = 5;
  let curPage = 1;

  function getRows() { return Array.from(tbl.querySelectorAll('tbody tr')); }

  function filterTable() {
    const q = (search ? search.value : '').trim().toLowerCase();
    getRows().forEach(r => r.classList.toggle('row-hide', q.length > 0 && !r.textContent.toLowerCase().includes(q)));
    curPage = 1;
    renderPages();
  }

  function visibleRows() { return getRows().filter(r => !r.classList.contains('row-hide')); }

  function renderPages() {
    const rows      = visibleRows();
    const pageCount = Math.ceil(rows.length / ROWS_PER_PAGE);
    const start     = (curPage - 1) * ROWS_PER_PAGE;
    const end       = start + ROWS_PER_PAGE;

    rows.forEach((r, i) => { r.style.display = (i >= start && i < end) ? '' : 'none'; });

    if (!pgWrap) return;
    pgWrap.innerHTML = '';

    for (let p = 1; p <= pageCount; p++) {
      const btn = document.createElement('button');
      btn.className = 'pgb' + (p === curPage ? ' on' : '');
      btn.textContent = p;
      btn.addEventListener('click', () => { curPage = p; renderPages(); });
      pgWrap.appendChild(btn);
    }

    if (pageCount > 1) {
      const nx = document.createElement('button');
      nx.className = 'pgb'; nx.textContent = '›';
      nx.addEventListener('click', () => { if (curPage < pageCount) { curPage++; renderPages(); } });
      pgWrap.appendChild(nx);

      const ls = document.createElement('button');
      ls.className = 'pgb'; ls.textContent = '»';
      ls.addEventListener('click', () => { curPage = pageCount; renderPages(); });
      pgWrap.appendChild(ls);
    }
  }

  window.filterTable = filterTable;
  renderPages();
})();

/* ── Coverflow click to center ───────────────────────────── */
(function initCoverflow() {
  document.querySelectorAll('.cf-img').forEach(img => {
    img.addEventListener('click', () => {
      document.querySelectorAll('.cf-img').forEach(i => i.classList.remove('c'));
      img.classList.add('c');
    });
  });
})();

/* ── Smooth anchor links ─────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
