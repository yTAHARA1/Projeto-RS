const homeHeader = document.querySelector('.home-header');
const mobileMenu = document.querySelector('#site-menu');
const menuToggle = document.querySelector('.mobile-menu-toggle');
const menuClose = document.querySelector('.mobile-menu-close');

if (typeof mobileMenu.showModal === 'function') {
  const menuItems = [menuClose, ...mobileMenu.querySelectorAll('a')];
  const mobileWidth = matchMedia('(max-width: 45rem)');
  let sectionAfterClose;
  menuToggle.addEventListener('click', () => {
    mobileMenu.showModal();
    menuToggle.setAttribute('aria-expanded', 'true');
    menuClose.focus();
  });
  menuClose.addEventListener('click', () => mobileMenu.close());
  mobileMenu.addEventListener('close', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    if (sectionAfterClose) {
      sectionAfterClose.tabIndex = -1;
      sectionAfterClose.focus({ preventScroll: true });
      sectionAfterClose = undefined;
    } else if (mobileWidth.matches) {
      menuToggle.focus({ preventScroll: true });
    }
  });
  mobileWidth.addEventListener('change', () => {
    if (!mobileWidth.matches && mobileMenu.open) mobileMenu.close();
  });
  mobileMenu.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href.startsWith('#')) sectionAfterClose = document.getElementById(href.slice(1));
    mobileMenu.close();
  });
  mobileMenu.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const first = menuItems[0], last = menuItems.at(-1);
    const end = event.shiftKey ? first : last;
    if (document.activeElement === end) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });
}

function updateHeader() {
  homeHeader.classList.toggle('is-compact', window.scrollY > 40);
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if ('IntersectionObserver' in window) {
  const sectionLinks = [...document.querySelectorAll('[data-section]')];
  const sections = [...new Set(sectionLinks.map(link => link.dataset.section))]
    .map(id => document.getElementById(id));
  const visibleSections = new Set();
  let engagedSection;
  function updateActiveSection() {
    const anchor = sections.find(section => '#' + section.id === location.hash);
    const preferred = visibleSections.has(anchor) ? anchor : engagedSection;
    const current = (visibleSections.has(preferred)
      ? preferred
      : sections.find(section => visibleSections.has(section)))?.id;
    for (const link of sectionLinks) {
      if (link.dataset.section === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  window.addEventListener('hashchange', updateActiveSection);
  const sectionObserver = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) visibleSections.add(target);
      else visibleSections.delete(target);
    }
    updateActiveSection();
  }, { rootMargin: '-80px 0px -' + Math.round(innerHeight * .45) + 'px 0px' });
  for (const section of sections) {
    sectionObserver.observe(section);
    const engage = () => {
      engagedSection = section;
      updateActiveSection();
    };
    section.addEventListener('focusin', engage);
    section.addEventListener('pointerenter', engage);
  }
}

const motionAllowed = matchMedia('(prefers-reduced-motion: no-preference)');
const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');
const buyButton = document.querySelector('#hero-actions .button-gold');
const themes = document.querySelector('[data-themes]');
const themeToggle = themes.querySelector('button');

function updateThemeMotion() {
  const enabled = motionAllowed.matches && 'IntersectionObserver' in window;
  themes.dataset.motion = enabled ? 'on' : 'off';
  themeToggle.hidden = !enabled;
}
themeToggle.addEventListener('click', () => {
  const paused = themeToggle.getAttribute('aria-pressed') !== 'true';
  themeToggle.setAttribute('aria-pressed', String(paused));
  themes.dataset.paused = String(paused);
});
motionAllowed.addEventListener('change', updateThemeMotion);
updateThemeMotion();

const revealItems = document.querySelectorAll('.home-paths .path, .reflection .questions, .home-about-grid, .home-faq .faq-grid');
if ('IntersectionObserver' in window) {
  const nativeTimeline = CSS.supports('animation-timeline', 'view()');
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (nativeTimeline) entry.target.classList.add('reveal-complete');
      else entry.target.classList.add('reveal-fallback');
      revealObserver.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -18% 0px', threshold: .3 });
  for (const item of revealItems) {
    item.dataset.reveal = '';
    revealObserver.observe(item);
  }
  const themeObserver = new IntersectionObserver(([entry]) => {
    themes.dataset.visible = String(entry.isIntersecting);
  });
  themeObserver.observe(themes);
}

const nativeHeroScroll = CSS.supports('animation-timeline', 'scroll(root block)')
  && CSS.supports('animation-range', '0px 70vh');
if (!nativeHeroScroll) {
  const visual = document.querySelector('.hero-visual');
  let scrollFrame = 0;
  let lastProgress;

  function scheduleHeroScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const range = Math.max(innerHeight * .7, 1);
      const progress = Math.max(0, Math.min(1, scrollY / range));
      if (lastProgress === progress) return;
      visual.style.setProperty('--hero-scroll-progress', progress);
      lastProgress = progress;
    });
  }

  function syncHeroScroll() {
    visual.classList.toggle('scroll-parallax-fallback', motionAllowed.matches);
    if (motionAllowed.matches) {
      addEventListener('scroll', scheduleHeroScroll, { passive: true });
      addEventListener('resize', scheduleHeroScroll, { passive: true });
      scheduleHeroScroll();
      return;
    }
    removeEventListener('scroll', scheduleHeroScroll);
    removeEventListener('resize', scheduleHeroScroll);
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
    lastProgress = undefined;
    visual.style.removeProperty('--hero-scroll-progress');
  }

  motionAllowed.addEventListener('change', syncHeroScroll);
  syncHeroScroll();
}

for (const element of [buyButton, ...document.querySelectorAll('.home-paths .path')]) {
  let pointerFrame = 0;
  element.addEventListener('pointermove', event => {
    if (!motionAllowed.matches || !precisePointer.matches || event.pointerType === 'touch') return;
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (element === buyButton) {
        const dx = x - rect.width / 2, dy = y - rect.height / 2;
        const scale = Math.min(.13, 6 / (Math.hypot(dx, dy) || 1));
        element.style.setProperty('--button-x', dx * scale + 'px');
        element.style.setProperty('--button-y', dy * scale + 'px');
      } else {
        element.style.setProperty('--mx', x + 'px');
        element.style.setProperty('--my', y + 'px');
      }
    });
  });
  element.addEventListener('pointerleave', () => {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    element.style.removeProperty('--button-x');
    element.style.removeProperty('--button-y');
  });
}
