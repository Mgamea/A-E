const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- preloader ---------- */
const loader = document.getElementById('loader');
if (loader) {
  window.addEventListener('load', () => setTimeout(() => loader.classList.add('done'), reduceMotion ? 0 : 650));
  setTimeout(() => loader.classList.add('done'), 3500);
}

/* ---------- nav + progress ---------- */
const hdr = document.getElementById('hdr');
const prog = document.getElementById('progress');
addEventListener('scroll', () => {
  hdr.classList.toggle('solid', scrollY > 40);
  if (prog) {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (scrollY / h * 100) + '%';
  }
}, { passive: true });

const burger = document.getElementById('burger');
const mnav = document.getElementById('mnav');
burger.addEventListener('click', () => {
  const open = mnav.classList.toggle('open');
  burger.classList.toggle('x', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mnav.classList.remove('open'); burger.classList.remove('x'); document.body.style.overflow = '';
}));

/* ---------- image fallback (hotlinked photos) ---------- */
document.querySelectorAll('.ph img').forEach(img => {
  img.addEventListener('error', () => { img.remove(); }, { once: true });
});

/* ---------- marquee ---------- */
const mq = document.getElementById('mqTrack');
if (mq) mq.innerHTML += mq.innerHTML;

/* ---------- gold dust ---------- */
const cv = document.getElementById('dust');
if (cv && !reduceMotion) {
  const ctx = cv.getContext('2d');
  let W, H, parts = [];
  const size = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
  size(); addEventListener('resize', size);
  const N = Math.min(70, Math.floor(innerWidth / 18));
  for (let i = 0; i < N; i++) parts.push({
    x: Math.random(), y: Math.random(),
    r: .6 + Math.random() * 1.8,
    s: .00018 + Math.random() * .00045,
    o: .15 + Math.random() * .5,
    w: Math.random() * Math.PI * 2
  });
  (function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y -= p.s; p.w += .008;
      if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
      ctx.beginPath();
      ctx.arc((p.x + Math.sin(p.w) * .006) * W, p.y * H, p.r, 0, 7);
      ctx.fillStyle = `rgba(222,184,104,${p.o * (0.55 + 0.45 * Math.sin(p.w * 2))})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  })();
}

/* ---------- reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* ---------- counters ---------- */
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  cio.unobserve(e.target);
  const to = +e.target.dataset.to, t0 = performance.now(), dur = reduceMotion ? 1 : 1400;
  (function step(t) {
    const k = Math.min((t - t0) / dur, 1);
    e.target.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}), { threshold: .6 });
document.querySelectorAll('.count').forEach(el => cio.observe(el));

/* ---------- service panels ---------- */
const panels = document.querySelectorAll('#panels .panel');
panels.forEach(p => {
  const activate = () => { panels.forEach(q => q.classList.remove('active')); p.classList.add('active'); };
  p.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) activate(); });
  p.addEventListener('click', e => { if (!e.target.closest('a')) activate(); });
});

/* ---------- before/after ---------- */
const stage = document.getElementById('baStage');
if (stage) {
  const after = document.getElementById('baAfter');
  const handle = document.getElementById('baHandle');
  const grip = handle.querySelector('.ba-grip');
  let dragging = false;
  const setPos = cx => {
    const r = stage.getBoundingClientRect();
    const p = Math.max(.03, Math.min(.97, (cx - r.left) / r.width));
    after.style.clipPath = `inset(0 0 0 ${p * 100}%)`;
    handle.style.left = p * 100 + '%';
    grip.setAttribute('aria-valuenow', Math.round(p * 100));
  };
  stage.addEventListener('pointerdown', e => { dragging = true; stage.setPointerCapture(e.pointerId); setPos(e.clientX); });
  stage.addEventListener('pointermove', e => dragging && setPos(e.clientX));
  ['pointerup', 'pointercancel'].forEach(ev => stage.addEventListener(ev, () => dragging = false));
  grip.addEventListener('keydown', e => {
    const r = stage.getBoundingClientRect(), now = +grip.getAttribute('aria-valuenow');
    if (e.key === 'ArrowLeft') setPos(r.left + r.width * (now - 4) / 100);
    if (e.key === 'ArrowRight') setPos(r.left + r.width * (now + 4) / 100);
  });
}

/* ---------- review carousel ---------- */
const slides = document.querySelectorAll('.rev-slide');
if (slides.length) {
  const dots = document.querySelectorAll('#revDots button');
  let cur = 0, timer;
  const show = i => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('on', k === cur));
    dots.forEach((d, k) => d.classList.toggle('on', k === cur));
  };
  const auto = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => show(cur + 1), 5600); };
  dots.forEach((d, k) => d.addEventListener('click', () => { show(k); auto(); }));
  auto();
}

/* ---------- quote form ----------
   The form opens the visitor's email client with a pre-filled message.
   TO RECEIVE SUBMISSIONS DIRECTLY: change QUOTE_EMAIL below, or replace
   the submit handler with a POST to your form service (Formspree,
   Web3Forms, your WordPress endpoint, etc.).
------------------------------------ */
const QUOTE_EMAIL = 'info@aeservices.ca'; // <-- CHANGE TO YOUR REAL INBOX
const qf = document.getElementById('quoteForm');
if (qf) {
  qf.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(qf);
    const subject = `Quote request — ${f.get('service')} — ${f.get('name')}`;
    const body =
`Name: ${f.get('name')}
Company: ${f.get('company') || '-'}
Phone: ${f.get('phone')}
Email: ${f.get('email')}
Service: ${f.get('service')}
Property address: ${f.get('address') || '-'}

Details:
${f.get('message') || '-'}`;
    window.location.href = `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.getElementById('qfOK').style.display = 'block';
  });
}
