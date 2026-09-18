export const FEEDBACK_MAX_LENGTH = 300;

export function isValidRating(value) {
  return Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 5;
}

export function isValidFeedback(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= FEEDBACK_MAX_LENGTH;
}

const templates = {
  ES: ({ rating, comment }) => `Hola, tuve una experiencia que me gustaría comentar.\n\nPuntuación: ${rating}/5\n\nComentario:\n${comment}\n\nMuchas gracias.`,
  EN: ({ rating, comment }) => `Hello, I had an experience that I would like to comment on.\n\nRating: ${rating}/5\n\nComment:\n${comment}\n\nThank you.`,
  PT: ({ rating, comment }) => `Olá, tive uma experiência que gostaria de comentar.\n\nAvaliação: ${rating}/5\n\nComentário:\n${comment}\n\nMuito obrigado.`
};

export function buildFeedbackMessage(rating, comment, language = 'ES') {
  if (!isValidRating(rating) || !isValidFeedback(comment)) return null;
  const selectedLanguage = templates[language] ? language : 'ES';
  return templates[selectedLanguage]({ rating: Number(rating), comment: comment.trim() });
}
