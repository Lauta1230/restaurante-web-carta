import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import MobileDock from './components/MobileDock';
import DigitalMenu from './components/DigitalMenu';
import ReservationFlow from './components/ReservationFlow';
import AssistanceFlow from './components/AssistanceFlow';
import ExperienceFeedback from './components/ExperienceFeedback';
import RestaurantImage from './components/RestaurantImage';
import { Button, Eyebrow, Icon, Reveal } from './components/UI';
import translations from './data/translations.json';
import config from './data/config.json';

const SUPPORTED_LANGUAGES = ['ES', 'EN', 'PT'];
const getInitialLanguage = () => {
  try {
    const stored = localStorage.getItem('elp-language');
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : 'ES';
  } catch {
    return 'ES';
  }
};

export default function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [assistanceOpen, setAssistanceOpen] = useState(false);
  const t = translations[language];
  useEffect(() => {
    try { localStorage.setItem('elp-language', language); } catch { /* Preferences still work when storage is unavailable. */ }
    document.documentElement.lang = language.toLowerCase();
  }, [language]);
  const openReservation = useCallback(() => setReservationOpen(true), []);
  const openWhatsApp = useCallback(() => window.open(`https://wa.me/${config.restaurant.whatsapp}`, '_blank', 'noopener,noreferrer'), []);
  const scrollMenu = () => document.querySelector('#carta')?.scrollIntoView({ behavior: 'smooth' });
  return <div className="app-shell">
    <Header language={language} setLanguage={setLanguage} copy={t.nav} onReserve={openReservation} onAssist={() => setAssistanceOpen(true)}/>
    <main>
      <section className="hero" id="inicio">
        <RestaurantImage id="restaurant-photo-09-grill-table" language={language} className="hero__image" decorative loading="eager" sizes="100vw"/>
        <div className="hero__shade" />
        <div className="hero__content">
          <div className="hero__line" />
          <p className="hero__eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.hero.title.split('\n').map((line,i)=><span key={i}>{line}</span>)}</h1>
          <p className="hero__subtitle">{t.hero.subtitle}</p>
          <div className="hero__actions"><Button onClick={scrollMenu} variant="cream">{t.hero.primary}</Button><Button onClick={openReservation} variant="ghost">{t.hero.secondary}</Button></div>
        </div>
        <a href="#experiencia" className="hero__scroll" aria-label="Continuar"><span>Scroll</span><i /></a>
      </section>

      <section className="intro section" id="experiencia">
        <Reveal className="intro__copy"><Eyebrow>{t.intro.eyebrow}</Eyebrow><h2>{t.intro.title}</h2><p>{t.intro.text}</p></Reveal>
        <Reveal className="intro__visual" delay={120}><RestaurantImage id="restaurant-photo-07-roasted-vegetables" language={language} sizes="(min-width: 700px) 340px, 82vw"/><span className="intro__seal"><span className="seal__ring">MENDOZA · ARGENTINA ·</span><strong>LP</strong><small>785</small></span></Reveal>
      </section>

      <DigitalMenu language={language} onReserve={openReservation} />

      <section className="fire section">
        <div className="fire__visual"><RestaurantImage id="restaurant-photo-01-meat-detail" language={language} sizes="(min-width: 700px) 55vw, 94vw"/><span aria-hidden="true">FUEGO</span></div>
        <Reveal className="fire__copy"><Eyebrow>{t.fire.eyebrow}</Eyebrow><h2>{t.fire.title}</h2><p>{t.fire.text}</p><div className="ornament"><i/><span>✦</span><i/></div></Reveal>
      </section>

      <section className="wine section">
        <div className="wine__image"><RestaurantImage id="restaurant-photo-04-cheese-and-wine" language={language} sizes="(min-width: 700px) 48vw, 90vw"/><span className="wine__label"><Icon name="grape"/><small>MENDOZA</small><b>32° 53′ S</b></span></div>
        <Reveal className="wine__copy"><Eyebrow>{t.wine.eyebrow}</Eyebrow><h2>{t.wine.title}</h2><p>{t.wine.text}</p></Reveal>
      </section>

      <section className="visit section" id="ubicacion">
        <Reveal><Eyebrow light>{t.visit.eyebrow}</Eyebrow><h2>{t.visit.title}</h2></Reveal>
        <Reveal className="visit__details" delay={100}><Icon name="pin" size={28}/><div><strong>{t.visit.address}</strong><span>{t.visit.city}</span></div><Button onClick={() => window.open(config.social.googleMaps, '_blank', 'noopener,noreferrer')} variant="text">{t.visit.map}</Button></Reveal>
        <div className="visit__contours" aria-hidden="true"><i/><i/><i/><i/></div>
      </section>

      <ExperienceFeedback language={language}/>
    </main>
    <footer className="footer">
      <div className="footer__brand"><span>LP</span><h3>Estancia<br/><i>La Pasión</i></h3></div>
      <p>{t.footer.tagline}</p>
      <div className="footer__rule"/>
      <small>{t.footer.note}</small><small>© {new Date().getFullYear()} · Mendoza</small>
    </footer>
    <MobileDock copy={t.dock} onReserve={openReservation} onWhatsApp={openWhatsApp} onAssist={() => setAssistanceOpen(true)}/>
    <ReservationFlow open={reservationOpen} language={language} onClose={() => setReservationOpen(false)}/>
    <AssistanceFlow open={assistanceOpen} language={language} onClose={() => setAssistanceOpen(false)}/>
  </div>;
}
