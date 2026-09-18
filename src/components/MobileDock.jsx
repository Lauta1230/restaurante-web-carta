import { Icon } from './UI';
export default function MobileDock({ copy, onReserve, onWhatsApp, onAssist }) {
  const actions = [
    ['plate', copy.menu, () => document.querySelector('#carta')?.scrollIntoView({behavior:'smooth'})],
    ['calendar', copy.book, onReserve], ['chat', copy.whatsapp, onWhatsApp], ['hand', copy.help, onAssist]
  ];
  return <nav className="mobile-dock" aria-label="Accesos rápidos">{actions.map(([icon,label,onClick]) => <button key={label} onClick={onClick}><Icon name={icon}/><span>{label}</span></button>)}</nav>;
}
