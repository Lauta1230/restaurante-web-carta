import fs from 'node:fs';
import menu from '../src/data/menu.json' with { type: 'json' };
import wines from '../src/data/wines.json' with { type: 'json' };
import pairings from '../src/data/pairings.json' with { type: 'json' };
import photography from '../src/data/photography.json' with { type: 'json' };
import config from '../src/data/config.json' with { type: 'json' };
import { convertFromARS, isValidRate } from '../src/utils/currency.js';
import { buildReservationMessage, buildWhatsAppUrl, createTimeSlots, isValidPartySize, isValidReservationDate, isValidReservationTime } from '../src/utils/reservation.js';
import { buildAssistanceMessage, isValidTableNumber } from '../src/utils/assistance.js';
import { buildFeedbackMessage, FEEDBACK_MAX_LENGTH, isValidFeedback, isValidRating } from '../src/utils/feedback.js';

const products = [...menu.items, ...wines.items];
const categories = [...menu.categories, ...wines.categories];
const expectedCounts = {
  entradas: 4, carnes: 13, 'platos-elaborados': 6, adicionales: 2, veggies: 1,
  pastas: 2, guarniciones: 5, 'menu-infantil': 3, ensaladas: 5, postres: 6,
  infusiones: 3, bebidas: 8, cervezas: 6, tragos: 5, bajativos: 2,
  'whisky-whiskey': 3, 'vinos-estancia': 2, 'vinos-especiales': 4, malbec: 17,
  'cabernet-sauvignon': 8, blends: 4, 'cabernet-franc': 4, varietales: 6,
  chardonnay: 4, dulces: 3, 'sauvignon-blanc': 3, 'vinos-3-8': 4,
  espumantes: 1, copas: 6
};
const errors = [];
if (products.length !== 140) errors.push(`Se esperaban 140 productos; hay ${products.length}.`);
if (categories.length !== 29) errors.push(`Se esperaban 29 categorías; hay ${categories.length}.`);
if (new Set(products.map(product => product.id)).size !== products.length) errors.push('Hay IDs de producto duplicados.');
for (const category of categories) {
  const count = products.filter(product => product.category === category.id).length;
  if (count !== expectedCounts[category.id]) errors.push(`${category.name.es}: se esperaban ${expectedCounts[category.id]}; hay ${count}.`);
}
for (const product of products) {
  if (!product.name?.es) errors.push(`${product.id}: falta el nombre de fuente.`);
  if (!Number.isInteger(product.priceARS) || product.priceARS <= 0) errors.push(`${product.id}: precio ARS inválido.`);
  if (!categories.some(category => category.id === product.category)) errors.push(`${product.id}: categoría inexistente.`);
  if (product.tags?.length) errors.push(`${product.id}: contiene etiquetas no validadas por la fuente.`);
}
const productIds = new Set(products.map(product => product.id));
const wineIds = new Set(wines.items.map(wine => wine.id));
const pairedProducts = [];
for (const pairing of pairings.pairings) {
  if (!Array.isArray(pairing.productIds) || !pairing.productIds.length) errors.push('Existe un maridaje sin productos.');
  if (!Array.isArray(pairing.recommendations) || pairing.recommendations.length !== 2) errors.push(`El maridaje ${pairing.productIds?.[0] || 'sin ID'} no tiene exactamente dos recomendaciones.`);
  for (const productId of pairing.productIds || []) {
    if (!productIds.has(productId)) errors.push(`Maridaje con producto inexistente: ${productId}.`);
    if (pairedProducts.includes(productId)) errors.push(`Producto duplicado en maridajes: ${productId}.`);
    pairedProducts.push(productId);
  }
  for (const recommendation of pairing.recommendations || []) {
    if (!wineIds.has(recommendation.wineId)) errors.push(`Maridaje con vino inexistente: ${recommendation.wineId}.`);
    if (!recommendation.reason?.es || !recommendation.reason?.en || !recommendation.reason?.pt) errors.push(`Razón de maridaje incompleta: ${recommendation.wineId}.`);
  }
}

// La función se verifica con tasas controladas; las tasas de producción pueden permanecer en cero.
if (convertFromARS(35000, 'ARS', {}) !== 35000) errors.push('La moneda base ARS fue alterada.');
if (convertFromARS(35000, 'USD', { USD: 0.001 }) !== 35) errors.push('Conversión USD incorrecta.');
if (convertFromARS(35000, 'BRL', { BRL: 0.006 }) !== 210) errors.push('Conversión BRL incorrecta.');
for (const invalid of [0, null, -1, Number.NaN, undefined]) {
  if (isValidRate(invalid) || convertFromARS(35000, 'USD', { USD: invalid }) !== null) errors.push(`Una tasa inválida produjo una conversión: ${invalid}.`);
}
if (convertFromARS(-1, 'USD', { USD: 1 }) !== null) errors.push('Un precio negativo produjo una conversión.');

const openingTime = config.restaurant.openingTime;
const closingTime = config.restaurant.closingTime;
const slots = createTimeSlots(openingTime, closingTime);
if (slots.length !== 24 || slots[0] !== '12:00' || slots.at(-1) !== '23:30') errors.push('Los horarios de reserva no coinciden con 12:00–23:30 en intervalos de 30 minutos.');
for (const validTime of ['12:00', '12:30', '23:00', '23:30']) if (!isValidReservationTime(validTime, openingTime, closingTime)) errors.push(`Horario válido rechazado: ${validTime}.`);
for (const invalidTime of ['11:59', '23:31', '24:00', '12:15', '']) if (isValidReservationTime(invalidTime, openingTime, closingTime)) errors.push(`Horario inválido aceptado: ${invalidTime}.`);
if (!isValidReservationDate('2026-09-17', '2026-09-17') || !isValidReservationDate('2026-09-18', '2026-09-17')) errors.push('Se rechazó una fecha actual o futura.');
for (const invalidDate of ['2026-09-16', '2026-02-30', '']) if (isValidReservationDate(invalidDate, '2026-09-17')) errors.push(`Fecha inválida aceptada: ${invalidDate}.`);
for (const validSize of ['1', '4', '100']) if (!isValidPartySize(validSize)) errors.push(`Cantidad válida rechazada: ${validSize}.`);
for (const invalidSize of ['0', '-1', '1.5', '', 'abc']) if (isValidPartySize(invalidSize)) errors.push(`Cantidad inválida aceptada: ${invalidSize}.`);
const sampleMessage = buildReservationMessage({ name: 'Lautaro', date: '2026-09-20', time: '21:30', people: '4' }, 'ES');
const sampleUrl = buildWhatsAppUrl(config.restaurant.whatsapp, sampleMessage);
if (!sampleUrl?.startsWith('https://wa.me/5492616694496?text=')) errors.push('La URL oficial de WhatsApp es inválida.');
if (!sampleUrl || decodeURIComponent(sampleUrl.split('?text=')[1]) !== sampleMessage) errors.push('El mensaje de WhatsApp no se codifica de forma reversible.');
if (buildWhatsAppUrl('invalid', sampleMessage) !== null || buildWhatsAppUrl(config.restaurant.whatsapp, '') !== null) errors.push('Se generó una URL de WhatsApp con datos inválidos.');

for (const validTable of ['1', '12', '999']) if (!isValidTableNumber(validTable)) errors.push(`Mesa válida rechazada: ${validTable}.`);
for (const invalidTable of ['0', '-1', '1.5', '', 'abc']) if (isValidTableNumber(invalidTable)) errors.push(`Mesa inválida aceptada: ${invalidTable}.`);
for (const language of ['ES', 'EN', 'PT']) {
  for (const type of ['waiter', 'bill', 'other']) {
    const assistanceMessage = buildAssistanceMessage('12', type, language);
    const assistanceUrl = buildWhatsAppUrl(config.restaurant.whatsapp, assistanceMessage);
    if (!assistanceMessage?.includes('12') || !assistanceUrl?.startsWith('https://wa.me/5492616694496?text=')) errors.push(`Flujo de asistencia inválido: ${language}/${type}.`);
  }
}
if (buildAssistanceMessage('0', 'waiter', 'ES') !== null || buildAssistanceMessage('12', 'invalid', 'ES') !== null) errors.push('Se generó asistencia con mesa o solicitud inválida.');

if (config.social.googleMaps !== 'https://maps.app.goo.gl/YJ88hoA9GAVYTgad7') errors.push('La URL de Google Maps no coincide con la oficial.');
if (config.social.instagram !== 'https://www.instagram.com/restauranteestancialapasion/') errors.push('La URL de Instagram no coincide con la oficial.');
if (config.restaurant.whatsapp !== '5492616694496') errors.push('El número de WhatsApp no coincide con el oficial.');
for (const validRating of [1, 2, 3, 4, 5]) if (!isValidRating(validRating)) errors.push(`Puntuación válida rechazada: ${validRating}.`);
for (const invalidRating of [0, 6, -1, 1.5, '', null]) if (isValidRating(invalidRating)) errors.push(`Puntuación inválida aceptada: ${invalidRating}.`);
if (!isValidFeedback('Comentario válido') || !isValidFeedback('x'.repeat(FEEDBACK_MAX_LENGTH))) errors.push('Se rechazó feedback válido.');
for (const invalidFeedback of ['', '   ', 'x'.repeat(FEEDBACK_MAX_LENGTH + 1), null]) if (isValidFeedback(invalidFeedback)) errors.push('Se aceptó feedback vacío o demasiado extenso.');
for (const language of ['ES', 'EN', 'PT']) {
  const feedbackMessage = buildFeedbackMessage(2, 'Comentario de prueba', language);
  const feedbackUrl = buildWhatsAppUrl(config.restaurant.whatsapp, feedbackMessage);
  if (!feedbackMessage?.includes('2/5') || !feedbackUrl?.startsWith('https://wa.me/5492616694496?text=')) errors.push(`Feedback inválido para ${language}.`);
}
if (buildFeedbackMessage(0, 'Comentario', 'ES') !== null || buildFeedbackMessage(2, '   ', 'ES') !== null) errors.push('Se generó feedback con datos inválidos.');
if (config.socialIncentive.enabled !== false) errors.push('El incentivo social debe permanecer desactivado hasta confirmación comercial.');

if (photography.photos.length !== 9) errors.push(`Se esperaban 9 fotografías reales; hay ${photography.photos.length}.`);
const photoIds = new Set();
const photoSources = new Set();
for (const photo of photography.photos) {
  if (photoIds.has(photo.id)) errors.push(`ID de fotografía duplicado: ${photo.id}.`);
  photoIds.add(photo.id);
  if (!fs.existsSync(photo.original)) errors.push(`Original inexistente: ${photo.original}.`);
  if (photo.productId !== null) errors.push(`${photo.id}: asociación de producto no validada.`);
  if (!photo.alt?.es || !photo.alt?.en || !photo.alt?.pt) errors.push(`${photo.id}: alt text incompleto.`);
  for (const source of photo.sources) {
    const diskPath = `public${source.src}`;
    if (!fs.existsSync(diskPath)) errors.push(`Imagen responsive inexistente: ${diskPath}.`);
    if (photoSources.has(source.src)) errors.push(`Fuente de imagen duplicada: ${source.src}.`);
    photoSources.add(source.src);
  }
}
if (photoSources.size !== 19) errors.push(`Se esperaban 19 derivados WebP; hay ${photoSources.size}.`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Integridad verificada: ${products.length} productos, ${categories.length} categorías, ${new Set(products.map(product => product.id)).size} IDs únicos.`);
console.log(`Sommelier verificado: ${pairedProducts.length} productos con dos recomendaciones y todos los wineId válidos.`);
console.log('Conversor verificado: ARS intacto, tasas USD/BRL válidas calculan y tasas inválidas no generan valores.');
console.log('Reservas verificadas: fechas, 24 horarios, cantidad de personas y URL oficial de WhatsApp válidos.');
console.log('Asistencia verificada: mesas válidas y tres solicitudes localizadas con destino oficial de WhatsApp.');
console.log('Feedback verificado: estrellas 1–5, comentario de hasta 300 caracteres y enlaces sociales oficiales.');
console.log('Incentivo social verificado: configurado y desactivado por defecto.');
console.log(`Fotografía verificada: ${photography.photos.length} originales reales y ${photoSources.size} derivados WebP sin asociaciones de producto.`);
