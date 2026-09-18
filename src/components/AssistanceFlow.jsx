import { useEffect, useState } from 'react';
import config from '../data/config.json';
import { Icon } from './UI';
import { buildWhatsAppUrl } from '../utils/reservation';
import { buildAssistanceMessage, isValidTableNumber } from '../utils/assistance';

const copyByLanguage = {
  ES: {
    kicker: 'Asistencia en mesa', title: '¿En qué mesa estás?', intro: 'Ingresá el número que figura en tu mesa para preparar el mensaje.', table: 'Número de mesa', placeholder: 'Ej. 12', error: 'Ingresá un número de mesa válido, mayor que cero.', continue: 'Continuar', close: 'Cerrar asistencia',
    requestTitle: '¿Qué necesitás?', requestIntro: 'Elegí una opción para comunicarte con el restaurante.', waiter: 'Llamar al mozo', waiterText: 'Solicitar atención en tu mesa.', bill: 'Pedir la cuenta', billText: 'Avisar que querés solicitar la cuenta.', other: 'Otra consulta', otherText: 'Iniciar una consulta por WhatsApp.', back: 'Cambiar mesa',
    prepared: 'Mensaje preparado', preparedText: 'WhatsApp se abrió con tu solicitud. El restaurante responderá por ese canal.', openAgain: 'Abrir WhatsApp nuevamente', finish: 'Finalizar', tableLabel: 'Mesa'
  },
  EN: {
    kicker: 'Table assistance', title: 'What is your table number?', intro: 'Enter the number shown on your table to prepare the message.', table: 'Table number', placeholder: 'E.g. 12', error: 'Enter a valid table number greater than zero.', continue: 'Continue', close: 'Close assistance',
    requestTitle: 'What do you need?', requestIntro: 'Choose an option to contact the restaurant.', waiter: 'Call the waiter', waiterText: 'Request assistance at your table.', bill: 'Ask for the bill', billText: 'Let us know that you would like the bill.', other: 'Another request', otherText: 'Start another request via WhatsApp.', back: 'Change table',
    prepared: 'Message prepared', preparedText: 'WhatsApp opened with your request. The restaurant will respond through that channel.', openAgain: 'Open WhatsApp again', finish: 'Finish', tableLabel: 'Table'
  },
  PT: {
    kicker: 'Assistência na mesa', title: 'Qual é o número da sua mesa?', intro: 'Digite o número indicado na sua mesa para preparar a mensagem.', table: 'Número da mesa', placeholder: 'Ex. 12', error: 'Digite um número de mesa válido, maior que zero.', continue: 'Continuar', close: 'Fechar assistência',
    requestTitle: 'O que você precisa?', requestIntro: 'Escolha uma opção para entrar em contato com o restaurante.', waiter: 'Chamar o garçom', waiterText: 'Solicitar atendimento na sua mesa.', bill: 'Pedir a conta', billText: 'Avisar que deseja solicitar a conta.', other: 'Outra solicitação', otherText: 'Iniciar outra solicitação pelo WhatsApp.', back: 'Alterar mesa',
    prepared: 'Mensagem preparada', preparedText: 'O WhatsApp foi aberto com sua solicitação. O restaurante responderá por esse canal.', openAgain: 'Abrir WhatsApp novamente', finish: 'Finalizar', tableLabel: 'Mesa'
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
    document.body.classList.add('modal-open');
    const onKey = event => event.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('modal-open'); removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const continueToRequest = event => {
    event.preventDefault();
    if (!isValidTableNumber(table)) { setError(copy.error); return; }
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
        <div className="assistance-heading"><span>01</span><h2 id="assistance-title">{copy.title}</h2><p>{copy.intro}</p></div>
        <form onSubmit={continueToRequest} noValidate>
          <label className={`assistance-table-field ${error ? 'assistance-table-field--error' : ''}`}>
            <span>{copy.table}</span>
            <input type="number" min="1" step="1" inputMode="numeric" value={table} onChange={event => { setTable(event.target.value); setError(''); }} placeholder={copy.placeholder} aria-invalid={Boolean(error)} required />
            {error && <small role="alert">{error}</small>}
          </label>
          <button className="assistance-primary" type="submit"><span>{copy.continue}</span><Icon name="arrow" size={17}/></button>
        </form>
      </div>}

      {step === 'request' && <div className="assistance-stage" key="request">
        <div className="assistance-heading"><span>02</span><small>{copy.tableLabel} {Number(table)}</small><h2 id="assistance-title">{copy.requestTitle}</h2><p>{copy.requestIntro}</p></div>
        <div className="assistance-options">
          <AssistanceOption icon="hand" title={copy.waiter} text={copy.waiterText} onClick={() => request('waiter')}/>
          <AssistanceOption icon="receipt" title={copy.bill} text={copy.billText} onClick={() => request('bill')}/>
          <AssistanceOption icon="chat" title={copy.other} text={copy.otherText} onClick={() => request('other')}/>
        </div>
        <button className="assistance-secondary" onClick={() => setStep('table')}>{copy.back}</button>
      </div>}

      {step === 'prepared' && <div className="assistance-stage assistance-stage--prepared" key="prepared">
        <div className="assistance-success"><Icon name="chat" size={28}/></div>
        <small>WhatsApp · {copy.tableLabel} {Number(table)}</small><h2 id="assistance-title">{copy.prepared}</h2><p>{copy.preparedText}</p>
        <a className="assistance-primary assistance-primary--whatsapp" href={preparedUrl} target="_blank" rel="noreferrer"><Icon name="chat" size={18}/><span>{copy.openAgain}</span><Icon name="arrow" size={17}/></a>
        <button className="assistance-secondary" onClick={onClose}>{copy.finish}</button>
      </div>}
    </section>
  </div>;
}

function AssistanceOption({ icon, title, text, onClick }) {
  return <button className="assistance-option" onClick={onClick}>
    <span className="assistance-option__icon"><Icon name={icon} size={21}/></span>
    <span><strong>{title}</strong><small>{text}</small></span>
    <Icon name="arrow" size={17}/>
  </button>;
}
