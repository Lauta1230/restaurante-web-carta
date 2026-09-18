import { useEffect, useMemo, useState } from 'react';
import config from '../data/config.json';
import { Icon } from './UI';
import {
  buildReservationMessage,
  buildWhatsAppUrl,
  createTimeSlots,
  formatReservationDate,
  isValidPartySize,
  isValidReservationDate,
  isValidReservationTime,
  localISODate
} from '../utils/reservation';

const copyByLanguage = {
  ES: {
    kicker: 'Solicitud de reserva', title: 'Reservar una mesa', intro: 'Completá los datos y prepararemos tu solicitud para enviarla al WhatsApp del restaurante.', pending: 'La reserva queda pendiente de confirmación.',
    name: 'Nombre', namePlaceholder: 'Tu nombre', date: 'Fecha', time: 'Hora', people: 'Cantidad de personas', peoplePlaceholder: 'Ej. 4', continue: 'Revisar solicitud', close: 'Cerrar reservas',
    nameError: 'Ingresá tu nombre.', dateError: 'Seleccioná una fecha válida que no sea anterior a hoy.', timeError: 'Seleccioná una hora entre las 12:00 y las 23:30.', peopleError: 'Ingresá una cantidad de personas mayor a cero, sin decimales.',
    summaryKicker: 'Antes de continuar', summaryTitle: 'Resumen de tu solicitud', edit: 'Editar', send: 'Enviar solicitud por WhatsApp',
    preparedKicker: 'WhatsApp', preparedTitle: 'Solicitud preparada', preparedText: 'Tu solicitud fue preparada para enviarse por WhatsApp. La reserva queda sujeta a confirmación del restaurante.', openAgain: 'Abrir WhatsApp', finish: 'Finalizar', hours: 'Horario de atención'
  },
  EN: {
    kicker: 'Reservation request', title: 'Reserve a table', intro: 'Complete the details and we will prepare your request to send to the restaurant’s WhatsApp.', pending: 'Your reservation remains pending confirmation.',
    name: 'Name', namePlaceholder: 'Your name', date: 'Date', time: 'Time', people: 'Number of guests', peoplePlaceholder: 'E.g. 4', continue: 'Review request', close: 'Close reservations',
    nameError: 'Enter your name.', dateError: 'Select a valid date that is not earlier than today.', timeError: 'Select a time between 12:00 and 23:30.', peopleError: 'Enter a whole number of guests greater than zero.',
    summaryKicker: 'Before continuing', summaryTitle: 'Request summary', edit: 'Edit', send: 'Send request via WhatsApp',
    preparedKicker: 'WhatsApp', preparedTitle: 'Request prepared', preparedText: 'Your request was prepared to be sent via WhatsApp. The reservation remains subject to confirmation by the restaurant.', openAgain: 'Open WhatsApp', finish: 'Finish', hours: 'Opening hours'
  },
  PT: {
    kicker: 'Solicitação de reserva', title: 'Reservar uma mesa', intro: 'Complete os dados e prepararemos sua solicitação para enviar ao WhatsApp do restaurante.', pending: 'A reserva fica pendente de confirmação.',
    name: 'Nome', namePlaceholder: 'Seu nome', date: 'Data', time: 'Horário', people: 'Quantidade de pessoas', peoplePlaceholder: 'Ex. 4', continue: 'Revisar solicitação', close: 'Fechar reservas',
    nameError: 'Digite seu nome.', dateError: 'Selecione uma data válida que não seja anterior a hoje.', timeError: 'Selecione um horário entre 12:00 e 23:30.', peopleError: 'Digite uma quantidade inteira de pessoas maior que zero.',
    summaryKicker: 'Antes de continuar', summaryTitle: 'Resumo da sua solicitação', edit: 'Editar', send: 'Enviar solicitação pelo WhatsApp',
    preparedKicker: 'WhatsApp', preparedTitle: 'Solicitação preparada', preparedText: 'Sua solicitação foi preparada para ser enviada pelo WhatsApp. A reserva está sujeita à confirmação do restaurante.', openAgain: 'Abrir WhatsApp', finish: 'Finalizar', hours: 'Horário de atendimento'
  }
};

const initialForm = { name: '', date: '', time: '', people: '2' };

export default function ReservationFlow({ open, language, onClose }) {
  const copy = copyByLanguage[language] || copyByLanguage.ES;
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form');
  const { openingTime, closingTime, whatsapp, timeZone } = config.restaurant;
  const today = localISODate(new Date(), timeZone);
  const timeSlots = useMemo(() => createTimeSlots(openingTime, closingTime), [openingTime, closingTime]);
  const message = useMemo(() => buildReservationMessage(form, language), [form, language]);
  const whatsappUrl = useMemo(() => buildWhatsAppUrl(whatsapp, message), [whatsapp, message]);

  useEffect(() => {
    if (!open) return;
    setForm(initialForm); setErrors({}); setStep('form');
    document.body.classList.add('modal-open');
    const onKey = event => event.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('modal-open'); removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    if (errors[field]) setErrors(current => ({ ...current, [field]: undefined }));
  };
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = copy.nameError;
    if (!isValidReservationDate(form.date, today)) next.date = copy.dateError;
    if (!isValidReservationTime(form.time, openingTime, closingTime)) next.time = copy.timeError;
    if (!isValidPartySize(form.people)) next.people = copy.peopleError;
    setErrors(next);
    return !Object.keys(next).length;
  };
  const review = event => {
    event.preventDefault();
    if (validate()) setStep('summary');
  };
  const send = () => {
    if (!validate() || !whatsappUrl) return;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setStep('prepared');
  };

  return <div className="reservation-backdrop" onMouseDown={onClose}>
    <section className="reservation-flow" role="dialog" aria-modal="true" aria-labelledby="reservation-title" onMouseDown={event => event.stopPropagation()}>
      <header className="reservation-flow__header">
        <span className="reservation-flow__monogram">LP</span>
        <div><small>{copy.kicker}</small><strong>Estancia La Pasión</strong></div>
        <button onClick={onClose} aria-label={copy.close} autoFocus><Icon name="close" size={22}/></button>
      </header>

      {step === 'form' && <div className="reservation-stage" key="form">
        <div className="reservation-heading"><span>01</span><h2 id="reservation-title">{copy.title}</h2><p>{copy.intro}</p></div>
        <form className="reservation-form" onSubmit={review} noValidate>
          <Field label={copy.name} error={errors.name}>
            <input type="text" value={form.name} onChange={event => update('name', event.target.value)} placeholder={copy.namePlaceholder} autoComplete="name" aria-invalid={Boolean(errors.name)} required />
          </Field>
          <div className="reservation-form__row">
            <Field label={copy.date} error={errors.date}>
              <input type="date" min={today} value={form.date} onChange={event => update('date', event.target.value)} aria-invalid={Boolean(errors.date)} required />
            </Field>
            <Field label={copy.time} error={errors.time}>
              <select value={form.time} onChange={event => update('time', event.target.value)} aria-invalid={Boolean(errors.time)} required>
                <option value="">—:—</option>{timeSlots.map(time => <option value={time} key={time}>{time}</option>)}
              </select>
            </Field>
          </div>
          <Field label={copy.people} error={errors.people}>
            <div className="people-control">
              <button type="button" onClick={() => update('people', String(Math.max(1, Number(form.people || 1) - 1)))} aria-label="−">−</button>
              <input type="number" min="1" step="1" inputMode="numeric" value={form.people} onChange={event => update('people', event.target.value)} placeholder={copy.peoplePlaceholder} aria-invalid={Boolean(errors.people)} required />
              <button type="button" onClick={() => update('people', String((Number(form.people) || 0) + 1))} aria-label="+">+</button>
            </div>
          </Field>
          <p className="reservation-pending"><Icon name="calendar" size={16}/>{copy.pending}</p>
          <button className="reservation-primary" type="submit"><span>{copy.continue}</span><Icon name="arrow" size={17}/></button>
        </form>
      </div>}

      {step === 'summary' && <div className="reservation-stage" key="summary">
        <div className="reservation-heading"><span>02</span><small>{copy.summaryKicker}</small><h2 id="reservation-title">{copy.summaryTitle}</h2></div>
        <dl className="reservation-summary">
          <div><dt>{copy.name}</dt><dd>{form.name.trim()}</dd></div>
          <div><dt>{copy.date}</dt><dd>{formatReservationDate(form.date, language)}</dd></div>
          <div><dt>{copy.time}</dt><dd>{form.time}</dd></div>
          <div><dt>{copy.people}</dt><dd>{form.people}</dd></div>
        </dl>
        <p className="reservation-pending"><Icon name="calendar" size={16}/>{copy.pending}</p>
        <button className="reservation-primary reservation-primary--whatsapp" onClick={send}><Icon name="chat" size={18}/><span>{copy.send}</span><Icon name="arrow" size={17}/></button>
        <button className="reservation-secondary" onClick={() => setStep('form')}>{copy.edit}</button>
      </div>}

      {step === 'prepared' && <div className="reservation-stage reservation-stage--prepared" key="prepared">
        <div className="reservation-success"><Icon name="chat" size={28}/></div>
        <small>{copy.preparedKicker}</small><h2 id="reservation-title">{copy.preparedTitle}</h2><p>{copy.preparedText}</p>
        {whatsappUrl && <a className="reservation-primary reservation-primary--whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer"><Icon name="chat" size={18}/><span>{copy.openAgain}</span><Icon name="arrow" size={17}/></a>}
        <button className="reservation-secondary" onClick={onClose}>{copy.finish}</button>
      </div>}

      <footer className="reservation-flow__footer"><span>{copy.hours}</span><strong>{openingTime} — {closingTime}</strong></footer>
    </section>
  </div>;
}

function Field({ label, error, children }) {
  return <label className={`reservation-field ${error ? 'reservation-field--error' : ''}`}>
    <span>{label}<b aria-hidden="true">*</b></span>{children}
    {error && <small role="alert">{error}</small>}
  </label>;
}
