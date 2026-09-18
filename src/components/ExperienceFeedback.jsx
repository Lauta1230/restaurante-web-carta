import { useEffect, useState } from 'react';
import config from '../data/config.json';
import { Icon, Reveal } from './UI';
import { buildWhatsAppUrl } from '../utils/reservation';
import { buildFeedbackMessage, FEEDBACK_MAX_LENGTH, isValidFeedback } from '../utils/feedback';

const copyByLanguage = {
  ES: {
    eyebrow: 'Tu experiencia', title: '¿Qué tal fue tu experiencia en Estancia La Pasión?', intro: 'Tu opinión nos ayuda a cuidar cada detalle.', ratingLabel: 'Seleccioná una puntuación', star: n => `${n} ${n === 1 ? 'estrella' : 'estrellas'} de 5`,
    sorry: 'Lamentamos que tu experiencia no haya sido la esperada.', improve: '¿Qué podemos mejorar?', placeholder: 'Contanos brevemente qué ocurrió…', empty: 'Escribí un comentario antes de continuar.', private: 'Enviar feedback privado', privateNote: 'El comentario se prepara para enviar únicamente por WhatsApp.',
    thanks: '¡Gracias por compartir tu experiencia!', share: '¿Querés contársela también a otros visitantes?', review: 'Dejar una reseña en Google', optional: 'Esta acción es completamente opcional.',
    prepared: 'Mensaje preparado', preparedText: 'Tu comentario está listo para enviarse por WhatsApp.', openWhatsApp: 'Abrir WhatsApp', reset: 'Enviar otro comentario',
    googleKicker: 'Canal externo', googleTitle: 'Encontranos en Google Maps', googleText: 'Consultá la ubicación oficial o accedé a Google de forma independiente.', maps: 'Ver en Google Maps',
    instagramKicker: 'Estancia La Pasión', instagramTitle: 'Seguinos en Instagram', instagramText: 'Descubrí nuestras novedades, platos y momentos de Estancia La Pasión.', instagram: 'Ver Instagram', opening: 'Abriendo Instagram…'
  },
  EN: {
    eyebrow: 'Your experience', title: 'How was your experience at Estancia La Pasión?', intro: 'Your opinion helps us take care of every detail.', ratingLabel: 'Select a rating', star: n => `${n} ${n === 1 ? 'star' : 'stars'} out of 5`,
    sorry: 'We are sorry that your experience did not meet your expectations.', improve: 'What could we improve?', placeholder: 'Briefly tell us what happened…', empty: 'Write a comment before continuing.', private: 'Send private feedback', privateNote: 'Your comment is prepared to be sent only through WhatsApp.',
    thanks: 'Thank you for sharing your experience!', share: 'Would you like to tell other visitors about it?', review: 'Leave a review on Google', optional: 'This action is completely optional.',
    prepared: 'Message prepared', preparedText: 'Your comment is ready to be sent via WhatsApp.', openWhatsApp: 'Open WhatsApp', reset: 'Send another comment',
    googleKicker: 'External channel', googleTitle: 'Find us on Google Maps', googleText: 'View the official location or access Google independently.', maps: 'View on Google Maps',
    instagramKicker: 'Estancia La Pasión', instagramTitle: 'Follow us on Instagram', instagramText: 'Discover news, dishes and moments from Estancia La Pasión.', instagram: 'View Instagram', opening: 'Opening Instagram…'
  },
  PT: {
    eyebrow: 'Sua experiência', title: 'Como foi sua experiência na Estancia La Pasión?', intro: 'Sua opinião nos ajuda a cuidar de cada detalhe.', ratingLabel: 'Selecione uma avaliação', star: n => `${n} ${n === 1 ? 'estrela' : 'estrelas'} de 5`,
    sorry: 'Lamentamos que sua experiência não tenha sido como esperava.', improve: 'O que podemos melhorar?', placeholder: 'Conte brevemente o que aconteceu…', empty: 'Escreva um comentário antes de continuar.', private: 'Enviar feedback privado', privateNote: 'O comentário é preparado para ser enviado somente pelo WhatsApp.',
    thanks: 'Obrigado por compartilhar sua experiência!', share: 'Gostaria de contar também para outros visitantes?', review: 'Deixar uma avaliação no Google', optional: 'Esta ação é totalmente opcional.',
    prepared: 'Mensagem preparada', preparedText: 'Seu comentário está pronto para ser enviado pelo WhatsApp.', openWhatsApp: 'Abrir WhatsApp', reset: 'Enviar outro comentário',
    googleKicker: 'Canal externo', googleTitle: 'Encontre-nos no Google Maps', googleText: 'Consulte a localização oficial ou acesse o Google de forma independente.', maps: 'Ver no Google Maps',
    instagramKicker: 'Estancia La Pasión', instagramTitle: 'Siga-nos no Instagram', instagramText: 'Descubra nossas novidades, pratos e momentos da Estancia La Pasión.', instagram: 'Ver Instagram', opening: 'Abrindo Instagram…'
  }
};

export default function ExperienceFeedback({ language }) {
  const copy = copyByLanguage[language] || copyByLanguage.ES;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [preparedUrl, setPreparedUrl] = useState('');
  const [instagramOpening, setInstagramOpening] = useState(false);

  useEffect(() => {
    if (!instagramOpening) return;
    const timeout = setTimeout(() => setInstagramOpening(false), 1200);
    return () => clearTimeout(timeout);
  }, [instagramOpening]);

  const selectRating = value => {
    setRating(value); setComment(''); setError(''); setPreparedUrl('');
  };
  const sendPrivateFeedback = () => {
    if (!isValidFeedback(comment)) { setError(copy.empty); return; }
    const message = buildFeedbackMessage(rating, comment, language);
    const url = buildWhatsAppUrl(config.restaurant.whatsapp, message);
    if (!url) { setError(copy.empty); return; }
    setPreparedUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const incentive = config.socialIncentive;
  const incentiveText = field => field?.[language.toLowerCase()] || field?.es || '';

  return <section className="experience-feedback" id="experiencia-feedback">
    <div className="feedback-main">
      <Reveal className="feedback-intro">
        <p className="eyebrow"><span />{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.intro}</p>
      </Reveal>

      <Reveal className="rating-panel" delay={100}>
        <div className="star-rating" role="radiogroup" aria-label={copy.ratingLabel}>
          {[1,2,3,4,5].map(value => <button type="button" role="radio" aria-checked={rating === value} aria-label={copy.star(value)} tabIndex={(rating || 1) === value ? 0 : -1} className={rating >= value ? 'selected' : ''} onClick={() => selectRating(value)} onKeyDown={event => {
            const next = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? Math.min(5, value + 1) : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? Math.max(1, value - 1) : null;
            if (next) { event.preventDefault(); selectRating(next); event.currentTarget.parentElement.children[next - 1]?.focus(); }
          }} key={value}><span aria-hidden="true">★</span><small>{value}</small></button>)}
        </div>
        {rating > 0 && <p className="rating-selected" aria-live="polite">{copy.star(rating)}</p>}

        {rating > 0 && rating <= 3 && <div className="feedback-response" key={`low-${rating}`}>
          <h3>{copy.sorry}</h3>
          {!preparedUrl ? <>
            <label className={`feedback-field ${error ? 'feedback-field--error' : ''}`}>
              <span>{copy.improve}</span>
              <textarea value={comment} maxLength={FEEDBACK_MAX_LENGTH} onChange={event => { setComment(event.target.value); setError(''); }} placeholder={copy.placeholder} rows="5" aria-invalid={Boolean(error)} />
              <small className="feedback-counter">{comment.length}/{FEEDBACK_MAX_LENGTH}</small>
              {error && <small className="feedback-error" role="alert">{error}</small>}
            </label>
            <button className="feedback-whatsapp" onClick={sendPrivateFeedback}><Icon name="chat" size={18}/><span>{copy.private}</span><Icon name="arrow" size={17}/></button>
            <p className="feedback-private-note">{copy.privateNote}</p>
          </> : <div className="feedback-prepared" role="status">
            <span><Icon name="chat" size={24}/></span><h3>{copy.prepared}</h3><p>{copy.preparedText}</p>
            <a href={preparedUrl} target="_blank" rel="noreferrer"><Icon name="chat" size={17}/>{copy.openWhatsApp}</a>
            <button onClick={() => { setPreparedUrl(''); setComment(''); }}>{copy.reset}</button>
          </div>}
          <a className="feedback-review-link" href={config.social.googleMaps} target="_blank" rel="noreferrer">{copy.review}<Icon name="arrow" size={15}/></a>
        </div>}

        {rating >= 4 && <div className="feedback-response feedback-response--positive" key={`high-${rating}`}>
          <span className="feedback-response__seal">LP</span><h3>{copy.thanks}</h3><p>{copy.share}</p>
          <a className="feedback-google" href={config.social.googleMaps} target="_blank" rel="noreferrer">{copy.review}<Icon name="arrow" size={17}/></a>
          <small>{copy.optional}</small>
        </div>}
      </Reveal>
    </div>

    <div className="social-links">
      <Reveal className="google-panel">
        <span className="social-index">01</span><small>{copy.googleKicker}</small><h3>{copy.googleTitle}</h3><p>{copy.googleText}</p>
        <a href={config.social.googleMaps} target="_blank" rel="noreferrer"><Icon name="pin" size={18}/>{copy.maps}<Icon name="arrow" size={16}/></a>
      </Reveal>
      <Reveal className="instagram-panel" delay={100}>
        <span className="social-index">02</span><small>{copy.instagramKicker}</small><h3>{copy.instagramTitle}</h3><p>{copy.instagramText}</p>
        <a href={config.social.instagram} target="_blank" rel="noreferrer" onClick={() => setInstagramOpening(true)}><Icon name="instagram" size={18}/>{instagramOpening ? copy.opening : copy.instagram}<Icon name="arrow" size={16}/></a>
      </Reveal>
    </div>

    {incentive.enabled && <Reveal className="social-incentive">
      <span>✦</span><div><small>Instagram · Estancia La Pasión</small><h3>{incentiveText(incentive.title)}</h3><p>{incentiveText(incentive.text)}</p></div>
      <a href={config.social.instagram} target="_blank" rel="noreferrer">{copy.instagram}<Icon name="arrow" size={16}/></a>
    </Reveal>}
  </section>;
}
