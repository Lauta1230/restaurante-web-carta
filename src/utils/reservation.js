const minutesFromTime = value => {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

export function createTimeSlots(openingTime = '12:00', closingTime = '23:30') {
  const opening = minutesFromTime(openingTime);
  const closing = minutesFromTime(closingTime);
  if (opening === null || closing === null || opening > closing) return [];
  return Array.from({ length: Math.floor((closing - opening) / 30) + 1 }, (_, index) => {
    const totalMinutes = opening + index * 30;
    return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
  });
}

export const RESERVATION_TIMES = createTimeSlots();

export function localISODate(date = new Date(), timeZone) {
  if (timeZone) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date).map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidReservationDate(value, today = localISODate()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  const exists = parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
  return exists && value >= today;
}

export function isValidReservationTime(value, openingTime = '12:00', closingTime = '23:30') {
  return createTimeSlots(openingTime, closingTime).includes(value);
}

export function isValidPartySize(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0 && Number.isSafeInteger(Number(value));
}

export function formatReservationDate(value, language = 'ES') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat({ ES: 'es-AR', EN: 'en-US', PT: 'pt-BR' }[language] || 'es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

const messageTemplates = {
  ES: ({ name, date, time, people }) => `Hola, quisiera solicitar una reserva en Estancia La Pasión.\n\nNombre: ${name}\nFecha: ${date}\nHora: ${time} hs\nPersonas: ${people}\n\nQuedo atento a la confirmación. Muchas gracias.`,
  EN: ({ name, date, time, people }) => `Hello, I would like to request a reservation at Estancia La Pasión.\n\nName: ${name}\nDate: ${date}\nTime: ${time}\nGuests: ${people}\n\nI look forward to your confirmation. Thank you.`,
  PT: ({ name, date, time, people }) => `Olá, gostaria de solicitar uma reserva na Estancia La Pasión.\n\nNome: ${name}\nData: ${date}\nHorário: ${time}\nPessoas: ${people}\n\nAguardo a confirmação. Muito obrigado.`
};

export function buildReservationMessage(data, language = 'ES') {
  return (messageTemplates[language] || messageTemplates.ES)({
    ...data,
    name: data.name.trim(),
    date: formatReservationDate(data.date, language)
  });
}

export function buildWhatsAppUrl(phone, message) {
  const normalizedPhone = String(phone || '').replace(/\D/g, '');
  if (!/^\d{10,15}$/.test(normalizedPhone) || !message?.trim()) return null;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
