import { useEffect, useState } from 'react';
import config from '../data/config.json';
import { Icon } from './UI';
import { buildWhatsAppUrl } from '../utils/reservation';
import { buildAssistanceMessage, isValidTableNumber } from '../utils/assistance';

const copyByLanguage = {
  ES: {
    kicker: 'Asistencia en mesa', title: '¿En qué mesa estás?', intro: 'Ingresá el número que figura en tu mesa para preparar el mensaje.', table: 'Número de mesa', placeholder: 'Ej. 12', error: 'Ingresá un número de mesa válido, mayor que cero.', continue: 'Continuar', close: 'Cerrar asistencia',
    requestTitle: '¿Qué necesitás?', requestIntro: 'Elegí una opción para comunicarte con el restaurante.', waiter: 'Llamar al mozo', waiterText: 'Solicitar atención en tu mesa.', bill: 'Pedir la cuenta', billText: 'Elegir el medio de pago y solicitar la cuenta.', other: 'Otra consulta', otherText: 'Iniciar una consulta por WhatsApp.', back: 'Cambiar mesa',
    paymentTitle: '¿Cómo preferís pagar?', paymentIntro: 'Elegí el medio de pago que querés indicar en la solicitud.', cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', backRequest: 'Volver a asistencia',
    prepared: 'Mensaje preparado', preparedText: 'Tu solicitud está lista para enviar por WhatsApp. El restaurante responderá por ese canal.', openAgain: 'Abrir WhatsApp nuevamente', finish: 'Finalizar', tableLabel: 'Mesa'
  },
  EN: {
    kicker: 'Table assistance', title: 'What is your table number?', intro: 'Enter the number shown on your table to prepare the message.', table: 'Table number', placeholder: 'E.g. 12', error: 'Enter a valid table number greater than zero.', continue: 'Continue', close: 'Close assistance',
    requestTitle: 'What do you need?', requestIntro: 'Choose an option to contact the restaurant.', waiter: 'Call the waiter', waiterText: 'Request assistance at your table.', bill: 'Ask for the bill', billText: 'Choose a payment method and ask for the bill.', other: 'Another request', otherText: 'Start another request via WhatsApp.', back: 'Change table',
    paymentTitle: 'How would you like to pay?', paymentIntro: 'Choose the payment method to include in your request.', cash: 'Cash', card: 'Card', transfer: 'Bank transfer', backRequest: 'Back to assistance',
    prepared: 'Message prepared', preparedText: 'Your request is ready to send via WhatsApp. The restaurant will respond through that channel.', openAgain: 'Open WhatsApp again', finish: 'Finish', tableLabel: 'Table'
  },
  PT: {
    kicker: 'Assistência na mesa', title: 'Qual é o número da sua mesa?', intro: 'Digite o número indicado na sua mesa para preparar a mensagem.', table: 'Número da mesa', placeholder: 'Ex. 12', error: 'Digite um número de mesa válido, maior que zero.', continue: 'Continuar', close: 'Fechar assistência',
    requestTitle: 'O que você precisa?', requestIntro: 'Escolha uma opção para entrar em contato com o restaurante.', waiter: 'Chamar o garçom', waiterText: 'Solicitar atendimento na sua mesa.', bill: 'Pedir a conta', billText: 'Escolher a forma de pagamento e pedir a conta.', other: 'Outra solicitação', otherText: 'Iniciar outra solicitação pelo WhatsApp.', back: 'Alterar mesa',
    paymentTitle: 'Como você prefere pagar?', paymentIntro: 'Escolha a forma de pagamento que deseja indicar na solicitação.', cash: 'Dinheiro', card: 'Cartão', transfer: 'Transferência', backRequest: 'Voltar à assistência',
    prepared: 'Mensagem preparada', preparedText: 'Sua solicitação está pronta para ser enviada pelo WhatsApp. O restaurante responderá por esse canal.', openAgain: 'Abrir WhatsApp novamente', finish: 'Finalizar', tableLabel: 'Mesa'
  }
};

export default function AssistanceFlow({ open, language, onClose }) {
  const copy = copyByLanguage[language] || copyByLanguage.ES;
  const [table, setTable] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('table');
  const [preparedUrl, setPreparedUrl] = useState('');

  useEffect(() => {
    if (!open) return;
    setTable(''); setError(''); setStep('table'); setPreparedUrl('');
    const previousFocus = document.activeElement;
    document.body.classList.add('modal-open');
    const onKey = event => event.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('modal-open');
      removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const continueToRequest = event => {
    event.preventDefault();
    if (!isValidTableNumber(table)) {
      setError(copy.error);
      requestAnimationFrame(() => document.querySelector('.assistance-table-field input')?.focus());
      return;
    }
    setError(''); setStep('request');
  };
  const request = type => {
    const message = buildAssistanceMessage(table, type, language);
    const url = buildWhatsAppUrl(config.restaurant.whatsapp, message);
    if (!url) { setStep('table'); setError(copy.error); return; }
    setPreparedUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
    setStep('prepared');
  };

  return <div className="assistance-backdrop" onMouseDown={onClose}>
    <section className="assistance-flow" role="dialog" aria-modal="true" aria-labelledby="assistance-title" onMouseDown={event => event.stopPropagation()}>
      <header className="assistance-flow__header">
        <span><Icon name="hand" size={20}/></span>
        <div><small>{copy.kicker}</small><strong>Estancia La Pasión</strong></div>
        <button onClick={onClose} aria-label={copy.close} autoFocus><Icon name="close" size={22}/></button>
      </header>

      {step === 'table' && <div className="assistance-stage" key="table">
        <div className="assistance-heading"><span>01</span><h2 id="assistance-title" tabIndex="-1" autoFocus>{copy.title}</h2><p>{copy.intro}</p></div>
        <form onSubmit={continueToRequest} noValidate>
          <label className={`assistance-table-field ${error ? 'assistance-table-field--error' : ''}`}>
            <span>{copy.table}</span>
            <input type="number" min="1" step="1" inputMode="numeric" value={table} onChange={event => { setTable(event.target.value); setError(''); }} placeholder={copy.placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? 'assistance-table-error' : undefined} required />
            {error && <small id="assistance-table-error" role="alert">{error}</small>}
          </label>
          <button className="assistance-primary" type="submit"><span>{copy.continue}</span><Icon name="arrow" size={17}/></button>
        </form>
      </div>}

      {step === 'request' && <div className="assistance-stage" key="request">
        <div className="assistance-heading"><span>02</span><small>{copy.tableLabel} {Number(table)}</small><h2 id="assistance-title" tabIndex="-1" autoFocus>{copy.requestTitle}</h2><p>{copy.requestIntro}</p></div>
        <div className="assistance-options">
          <AssistanceOption icon="hand" title={copy.waiter} text={copy.waiterText} onClick={() => request('waiter')}/>
          <AssistanceOption icon="receipt" title={copy.bill} text={copy.billText} onClick={() => setStep('payment')}/>
          <AssistanceOption icon="chat" title={copy.other} text={copy.otherText} onClick={() => request('other')}/>
        </div>
        <button className="assistance-secondary" onClick={() => setStep('table')}>{copy.back}</button>
      </div>}

      {step === 'payment' && <div className="assistance-stage" key="payment">
        <div className="assistance-heading"><span>03</span><small>{copy.tableLabel} {Number(table)}</small><h2 id="assistance-title" tabIndex="-1" autoFocus>{copy.paymentTitle}</h2><p>{copy.paymentIntro}</p></div>
        <div className="assistance-options">
          <AssistanceOption icon="cash" title={copy.cash} onClick={() => request('billCash')}/>
          <AssistanceOption icon="card" title={copy.card} onClick={() => request('billCard')}/>
          <AssistanceOption icon="transfer" title={copy.transfer} onClick={() => request('billTransfer')}/>
        </div>
        <button className="assistance-secondary" onClick={() => setStep('request')}>{copy.backRequest}</button>
      </div>}

      {step === 'prepared' && <div className="assistance-stage assistance-stage--prepared" key="prepared">
        <div className="assistance-success"><Icon name="chat" size={28}/></div>
        <small>WhatsApp · {copy.tableLabel} {Number(table)}</small><h2 id="assistance-title" tabIndex="-1" autoFocus>{copy.prepared}</h2><p>{copy.preparedText}</p>
        <a className="assistance-primary assistance-primary--whatsapp" href={preparedUrl} target="_blank" rel="noreferrer"><Icon name="chat" size={18}/><span>{copy.openAgain}</span><Icon name="arrow" size={17}/></a>
        <button className="assistance-secondary" onClick={onClose}>{copy.finish}</button>
      </div>}
    </section>
  </div>;
}

function AssistanceOption({ icon, title, text, onClick }) {
  return <button className="assistance-option" onClick={onClick}>
    <span className="assistance-option__icon"><Icon name={icon} size={21}/></span>
    <span><strong>{title}</strong>{text && <small>{text}</small>}</span>
    <Icon name="arrow" size={17}/>
  </button>;
}
