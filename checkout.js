const tracking = [...new URLSearchParams(window.location.search)]
  .filter(([key]) => /^utm_[a-z0-9_]+$/i.test(key));

if (tracking.length > 0) {
  for (const link of document.querySelectorAll('[data-checkout], [data-track-campaign]')) {
    const destination = new URL(link.href);
    for (const [key, value] of tracking) {
      destination.searchParams.append(key, value);
    }
    link.href = destination.href;
  }
}
