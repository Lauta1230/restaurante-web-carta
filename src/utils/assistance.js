const requestMessages = {
  waiter: {
    ES: 'Necesito llamar al mozo.',
    EN: 'I would like to call the waiter.',
    PT: 'Gostaria de chamar o garçom.'
  },
  billCash: {
    ES: 'Quisiera pedir la cuenta. Medio de pago: efectivo.',
    EN: 'I would like to ask for the bill. Payment method: cash.',
    PT: 'Gostaria de pedir a conta. Forma de pagamento: dinheiro.'
  },
  billCard: {
    ES: 'Quisiera pedir la cuenta. Medio de pago: tarjeta.',
    EN: 'I would like to ask for the bill. Payment method: card.',
    PT: 'Gostaria de pedir a conta. Forma de pagamento: cartão.'
  },
  billTransfer: {
    ES: 'Quisiera pedir la cuenta. Medio de pago: transferencia.',
    EN: 'I would like to ask for the bill. Payment method: bank transfer.',
    PT: 'Gostaria de pedir a conta. Forma de pagamento: transferência.'
  },
  other: {
    ES: 'Tengo otra consulta.',
    EN: 'I have another request.',
    PT: 'Tenho outra solicitação.'
  }
};

const templates = {
  ES: ({ table, request }) => `Hola, estoy en la mesa ${table} de Estancia La Pasión.\n\n${request}\n\nMuchas gracias.`,
  EN: ({ table, request }) => `Hello, I am at table ${table} at Estancia La Pasión.\n\n${request}\n\nThank you.`,
  PT: ({ table, request }) => `Olá, estou na mesa ${table} da Estancia La Pasión.\n\n${request}\n\nMuito obrigado.`
};

export function isValidTableNumber(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0 && Number.isSafeInteger(Number(value));
}

export function buildAssistanceMessage(table, requestType, language = 'ES') {
  if (!isValidTableNumber(table) || !requestMessages[requestType]) return null;
  const selectedLanguage = templates[language] ? language : 'ES';
  return templates[selectedLanguage]({
    table: String(Number(table)),
    request: requestMessages[requestType][selectedLanguage]
  });
}
