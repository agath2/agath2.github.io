document.getElementById('year').textContent = new Date().getFullYear();

// Highlight the sidebar link for the section currently in view.
const navLinks = document.querySelectorAll('.nav a');
const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href')));

const setActive = id => {
  navLinks.forEach(a => {
    const on = a.getAttribute('href') === '#' + id;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
};

const spy = () => {
  // The active section is the last one whose top has passed the upper third of the viewport.
  const line = window.innerHeight * 0.33;
  let current = sections[0];
  sections.forEach(s => { if (s.getBoundingClientRect().top <= line) current = s; });
  setActive(current.id);
};
addEventListener('scroll', spy, { passive: true });
addEventListener('resize', spy);
spy();

// Soft glow that follows the cursor. Skipped for touch screens and reduced motion.
if (matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const root = document.documentElement;
  addEventListener('pointermove', e => {
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });
}
