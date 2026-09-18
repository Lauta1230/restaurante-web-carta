import { useEffect, useRef } from 'react';

export function Icon({ name, size = 20 }) {
  const paths = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    down: <><path d="m8 10 4 4 4-4"/></>,
    plate: <><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></>,
    calendar: <><path d="M5 5h14v14H5zM8 3v4M16 3v4M5 9h14"/></>,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/></>,
    cash: <><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M7 9h.01M17 15h.01"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></>,
    transfer: <><path d="M5 8h14M15 4l4 4-4 4M19 16H5M9 12l-4 4 4 4"/></>,
    chat: <><path d="M5 5h14v11H9l-4 3z"/></>,
    hand: <><path d="M8 12V7a2 2 0 0 1 4 0v4-6a2 2 0 0 1 4 0v7l1-1a2 2 0 0 1 3 2l-2 5a4 4 0 0 1-4 3h-3a5 5 0 0 1-4-2l-3-4a2 2 0 0 1 4-3z"/></>,
    pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11z"/><circle cx="12" cy="10" r="2"/></>,
    instagram: <><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><path d="M17.5 6.5h.01"/></>,
    grape: <><circle cx="10" cy="9" r="2.5"/><circle cx="14" cy="9" r="2.5"/><circle cx="8" cy="13" r="2.5"/><circle cx="12" cy="13" r="2.5"/><circle cx="16" cy="13" r="2.5"/><circle cx="10" cy="17" r="2.5"/><circle cx="14" cy="17" r="2.5"/><path d="M12 6c1-2 3-3 5-3"/></>
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function Button({ children, variant = 'primary', onClick, href, icon = true, className = '' }) {
  const Tag = href ? 'a' : 'button';
  return <Tag href={href} onClick={onClick} className={`button button--${variant} ${className}`}>{children}{icon && <Icon name="arrow" size={17}/>}</Tag>;
}

export function Eyebrow({ children, light = false }) {
  return <p className={`eyebrow ${light ? 'eyebrow--light' : ''}`}><span />{children}</p>;
}

export function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) { el?.classList.add('is-visible'); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('is-visible'); observer.unobserve(el); }
    }, { threshold: .12, rootMargin: '0px 0px -40px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ '--delay': `${delay}ms` }}>{children}</div>;
}

export function Modal({ open, onClose, copy }) {
  useEffect(() => {
    if (!open) return;
    const key = e => e.key === 'Escape' && onClose();
    document.body.classList.add('modal-open');
    addEventListener('keydown', key);
    return () => { document.body.classList.remove('modal-open'); removeEventListener('keydown', key); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={e => e.stopPropagation()}>
      <button className="modal__close" onClick={onClose} aria-label={copy.close}><Icon name="close"/></button>
      <span className="modal__monogram">LP</span>
      <h2 id="modal-title">{copy.title}</h2>
      <p>{copy.text}</p>
      <Button onClick={onClose} variant="dark" icon={false}>{copy.close}</Button>
    </div>
  </div>;
}
