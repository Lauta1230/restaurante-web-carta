const locales = { ES: 'es-AR', EN: 'en-US', PT: 'pt-BR' };

export const isValidRate = rate => Number.isFinite(rate) && rate > 0;

export function convertFromARS(priceARS, currency, rates) {
  if (currency === 'ARS') return priceARS;
  const rate = rates?.[currency];
  if (!Number.isFinite(priceARS) || priceARS < 0 || !isValidRate(rate)) return null;
  return priceARS * rate;
}

export function formatARS(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0
  }).format(value);
}

export function formatCurrency(value, currency, language = 'ES') {
  if (!Number.isFinite(value)) return '';
  return new Intl.NumberFormat(locales[language] || locales.ES, {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(value);
}
