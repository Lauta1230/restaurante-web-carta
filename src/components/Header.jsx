import { useEffect, useState } from 'react';
import { Icon } from './UI';

export default function Header({ language, setLanguage, copy, onReserve, onAssist }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 32);
    onScroll(); addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);
  const go = id => { setMenuOpen(false); document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' }); };
  return <>
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <button className="brand" onClick={() => go('#inicio')} aria-label="Estancia La Pasión, inicio">
        <span className="brand__mark">LP</span><span className="brand__name">Estancia <b>La Pasión</b></span>
      </button>
      <nav className="desktop-nav" aria-label="Navegación principal">
        <button onClick={() => go('#experiencia')}>{copy.story}</button>
        <button onClick={() => go('#carta')}>{copy.menu}</button>
        <button className="desktop-nav__reserve" onClick={onReserve}>{copy.reserve}</button>
        <button onClick={onAssist}>{copy.assistance}</button>
        <button onClick={() => go('#ubicacion')}>{copy.location}</button>
      </nav>
      <div className="header__actions">
        <label className="language"><span className="sr-only">Idioma</span>
          <select value={language} onChange={e => setLanguage(e.target.value)} aria-label="Seleccionar idioma">
            <option value="ES">🇦🇷 ES</option><option value="EN">🇺🇸 EN</option><option value="PT">🇧🇷 PT</option>
          </select><Icon name="down" size={13}/>
        </label>
        <button className="menu-toggle" aria-expanded={menuOpen} aria-label="Abrir menú" onClick={() => setMenuOpen(v => !v)}><Icon name={menuOpen ? 'close' : 'menu'} size={23}/></button>
      </div>
    </header>
    <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`} aria-hidden={!menuOpen}>
      <nav>
        {[
          { label: copy.home, action: () => go('#inicio') },
          { label: copy.story, action: () => go('#experiencia') },
          { label: copy.menu, action: () => go('#carta') },
          { label: copy.reserve, action: () => { setMenuOpen(false); onReserve(); } },
          { label: copy.assistance, action: () => { setMenuOpen(false); onAssist(); } },
          { label: copy.location, action: () => go('#ubicacion') }
        ].map(({ label, action }, i) => <button key={label} onClick={action}><small>0{i+1}</small>{label}</button>)}
      </nav>
      <p>Av. Sarmiento 785<br/>Ciudad de Mendoza</p>
    </div>
  </>;
}
