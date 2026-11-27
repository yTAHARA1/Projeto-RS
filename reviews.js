const PLACE_ID = '[PREENCHER]';

// [PREENCHER] Apenas avaliações autorizadas. Use primeiro nome ou iniciais,
// estrelas de 1 a 5, texto autorizado e data no formato AAAA-MM-DD.
// Campos: autor [PREENCHER], estrelas [PREENCHER], texto [PREENCHER], data [PREENCHER].
const REVIEWS = [];

if (PLACE_ID && PLACE_ID !== '[PREENCHER]') {
  const read = document.querySelector('[data-google-review="read"]');
  const write = document.querySelector('[data-google-review="write"]');
  const maps = new URL(read.href);
  maps.searchParams.set('query_place_id', PLACE_ID);
  read.href = maps.href;
  write.href = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(PLACE_ID)}`;
  write.removeAttribute('aria-disabled');
  write.removeAttribute('role');
}

if (REVIEWS.length) {
  const list = document.querySelector('.reviews-list');
  const template = document.querySelector('#review-card-template');
  const star = document.querySelector('.reviews-rating .reviews-stars svg:last-child');
  const formatDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' });

  for (const { autor, estrelas, texto, data } of REVIEWS) {
    const card = template.content.firstElementChild.cloneNode(true);
    const rating = card.querySelector('.reviews-stars');
    const date = card.querySelector('time');
    card.querySelector('[data-review-author]').textContent = autor;
    card.querySelector('[data-review-text]').textContent = texto;
    date.dateTime = data;
    date.textContent = formatDate.format(new Date(data));
    rating.setAttribute('aria-label', `${estrelas} de 5 estrelas`);
    for (let index = 0; index < 5; index++) {
      const icon = star.cloneNode(true);
      icon.classList.toggle('review-star-unfilled', index >= estrelas);
      rating.append(icon);
    }
    list.append(card);
  }
  list.hidden = false;
  if (list.children.length > 1) list.tabIndex = 0;
}

if ('IntersectionObserver' in window) {
  const entryObserver = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      target.classList.toggle('reviews-entered', matchMedia('(prefers-reduced-motion: no-preference)').matches);
      entryObserver.unobserve(target);
    }
  }, { threshold: .15 });
  document.querySelectorAll('[data-review-enter]').forEach(item => entryObserver.observe(item));
}
