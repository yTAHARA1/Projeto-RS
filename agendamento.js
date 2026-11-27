const bookingForm = document.querySelector('#whatsapp-agendamento');
const bookingName = bookingForm.elements.namedItem('nome');
const cleanField = value => value.trim().replace(/\s+/g, ' ');
const number = bookingForm.dataset.whatsappNumber;
const hasRecipient = /^\d{10,15}$/.test(number);

document.querySelector('#booking-recipient').hidden = hasRecipient;

bookingName.addEventListener('input', () => bookingName.setCustomValidity(''));

bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(bookingForm);
  const name = cleanField(fields.get('nome'));
  if (!name) {
    bookingName.setCustomValidity('Informe seu nome.');
    bookingName.reportValidity();
    return;
  }

  const period = cleanField(fields.get('periodo'));
  const availability = cleanField(fields.get('disponibilidade'));
  const lines = [
    'Olá, Renan! Gostaria de consultar a disponibilidade para atendimento psicológico.',
    '',
    `Nome: ${name}`,
    `Melhor período: ${period}`
  ];
  if (availability) {
    lines.push(`Dias ou horários disponíveis: ${availability}`);
  }

  const destination = new URL('https://wa.me/');
  if (hasRecipient) {
    destination.pathname = number;
  }
  destination.searchParams.set('text', lines.join('\n'));
  window.location.assign(destination.href);
});

bookingForm.hidden = false;
