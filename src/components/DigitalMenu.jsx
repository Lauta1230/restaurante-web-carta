import { useEffect, useMemo, useRef, useState } from 'react';
import menuData from '../data/menu.json';
import winesData from '../data/wines.json';
import config from '../data/config.json';
import pairingsData from '../data/pairings.json';
import { convertFromARS, formatARS, formatCurrency, isValidRate } from '../utils/currency';
import { Icon } from './UI';
import RestaurantImage from './RestaurantImage';

const localeKey = language => language.toLowerCase();
const textFor = (field, language) => field?.[localeKey(language)] || field?.es || '';
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const ui = {
  ES: { eyebrow: 'Carta digital', title: 'Nuestra carta', subtitle: 'Explorá la propuesta completa de Estancia La Pasión.', search: 'Buscar un plato, bebida o vino', results: 'resultados', oneResult: 'resultado', emptyTitle: 'No encontramos resultados', emptyText: 'Probá con otro nombre o revisá las categorías.', clear: 'Limpiar búsqueda', products: 'opciones', categories: 'categorías', close: 'Cerrar detalle', official: 'Precio oficial en pesos argentinos', source: 'Carta oficial', winery: 'Bodega', unavailable: 'Tasa pendiente', pairing: 'Ver maridaje', pairingTitle: 'Maridaje sugerido', pairingIntro: 'Dos vinos de nuestra carta para acompañar este plato.', pairingClose: 'Cerrar maridaje', option: 'Opción equilibrada', otherOption: 'Opción premium', reference: 'Valor orientativo', rateDate: 'Tasa actualizada', reserve: 'Reservar mesa', reservePrompt: '¿Querés compartir esta experiencia?' },
  EN: { eyebrow: 'Digital menu', title: 'Our menu', subtitle: 'Explore the complete selection at Estancia La Pasión.', search: 'Search for a dish, drink or wine', results: 'results', oneResult: 'result', emptyTitle: 'No results found', emptyText: 'Try another name or browse the categories.', clear: 'Clear search', products: 'options', categories: 'categories', close: 'Close details', official: 'Official price in Argentine pesos', source: 'Official menu', winery: 'Winery', unavailable: 'Rate pending', pairing: 'Wine pairing', pairingTitle: 'Suggested pairing', pairingIntro: 'Two wines from our menu to accompany this dish.', pairingClose: 'Close pairing', option: 'Balanced option', otherOption: 'Premium option', reference: 'Reference value', rateDate: 'Rate updated', reserve: 'Reserve a table', reservePrompt: 'Would you like to share this experience?' },
  PT: { eyebrow: 'Cardápio digital', title: 'Nosso cardápio', subtitle: 'Explore a proposta completa da Estancia La Pasión.', search: 'Buscar um prato, bebida ou vinho', results: 'resultados', oneResult: 'resultado', emptyTitle: 'Nenhum resultado encontrado', emptyText: 'Tente outro nome ou consulte as categorias.', clear: 'Limpar busca', products: 'opções', categories: 'categorias', close: 'Fechar detalhes', official: 'Preço oficial em pesos argentinos', source: 'Cardápio oficial', winery: 'Vinícola', unavailable: 'Taxa pendente', pairing: 'Harmonização', pairingTitle: 'Harmonização sugerida', pairingIntro: 'Dois vinhos da nossa carta para acompanhar este prato.', pairingClose: 'Fechar harmonização', option: 'Opção equilibrada', otherOption: 'Opção premium', reference: 'Valor orientativo', rateDate: 'Taxa atualizada', reserve: 'Reservar uma mesa', reservePrompt: 'Quer compartilhar esta experiência?' }
};

function PriceDisplay({ priceARS, currency, language, className = '' }) {
  const converted = currency === 'ARS' ? null : convertFromARS(priceARS, currency, config.currency.rates);
  return <span className={`price-display ${className}`} key={`${currency}-${priceARS}`}>
    <span className="price-display__base"><small>ARS</small>{formatARS(priceARS).replace('$', '').trim()}</span>
    {converted !== null && <span className="price-display__converted">≈ {formatCurrency(converted, currency, language)}</span>}
  </span>;
}

function PairingPanel({ pairing, winesById, language, currency, onClose }) {
  const copy = ui[language];
  if (!pairing) return null;
  return <div className="pairing-backdrop" onMouseDown={event => { event.stopPropagation(); onClose(); }}>
    <aside className="pairing-panel" role="dialog" aria-modal="true" aria-labelledby="pairing-title" onMouseDown={event => event.stopPropagation()}>
      <header className="pairing-panel__header">
        <span className="pairing-panel__mark"><Icon name="grape" size={21}/></span>
        <div><small>Sommelier · La Pasión</small><h3 id="pairing-title">{copy.pairingTitle}</h3></div>
        <button onClick={onClose} aria-label={copy.pairingClose} autoFocus><Icon name="close" size={22}/></button>
      </header>
      <p className="pairing-panel__intro">{copy.pairingIntro}</p>
      <div className="pairing-options">
        {pairing.recommendations.map((recommendation, index) => {
          const wine = winesById[recommendation.wineId];
          if (!wine) return null;
          return <article className="pairing-option" key={recommendation.wineId}>
            <div className="pairing-option__label"><span>0{index + 1}</span>{index === 0 ? copy.option : copy.otherOption}</div>
            <h4>{textFor(wine.name, language)}</h4>
            <p className="pairing-option__type">{textFor(wine.categoryName, language)}{wine.winery ? ` · ${textFor(wine.winery, language)}` : ''}</p>
            <p className="pairing-option__reason">{textFor(recommendation.reason, language)}</p>
            <PriceDisplay priceARS={wine.priceARS} currency={currency} language={language} className="price-display--pairing" />
          </article>;
        })}
      </div>
      {currency !== 'ARS' && <p className="pairing-panel__reference">≈ {copy.reference}</p>}
    </aside>
  </div>;
}

const editorialBreaks = {
  entradas: 'restaurant-photo-06-empanada-selection',
  carnes: 'restaurant-photo-02-table-spread',
  'platos-elaborados': 'restaurant-photo-03-plated-dish',
  pastas: 'restaurant-photo-05-pasta-dish',
  postres: 'restaurant-photo-08-flan-dessert'
};

function MenuEditorialBreak({ photoId, language }) {
  return <figure className={`menu-editorial-photo menu-editorial-photo--${photoId}`}>
    <RestaurantImage id={photoId} language={language} sizes="(min-width: 960px) 1180px, 100vw"/>
    <figcaption><span>Estancia La Pasión</span><small>Mendoza · Argentina</small></figcaption>
  </figure>;
}

function ProductModal({ product, pairing, winesById, language, currency, onClose }) {
  const copy = ui[language];
  const [pairingOpen, setPairingOpen] = useState(false);
  useEffect(() => { setPairingOpen(false); }, [product]);
  useEffect(() => {
    if (!product) return;
    document.body.classList.add('modal-open');
    const onKey = event => event.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('modal-open'); removeEventListener('keydown', onKey); };
  }, [product, onClose]);
  if (!product) return null;
  const description = textFor(product.description, language);
  const detail = textFor(product.detail, language);
  const winery = textFor(product.winery, language);
  return <div className="product-modal-backdrop" onMouseDown={onClose}>
    <article className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-title" onMouseDown={event => event.stopPropagation()}>
      <div className="product-modal__topline"><span>{copy.source}</span><button onClick={onClose} aria-label={copy.close} autoFocus><Icon name="close" size={22}/></button></div>
      <div className="product-modal__category">{textFor(product.categoryName, language)}</div>
      <h2 id="product-title">{textFor(product.name, language)}</h2>
      {detail && <p className="product-modal__detail">{detail}</p>}
      {winery && <p className="product-modal__winery"><span>{copy.winery}</span>{winery.replace(/^Bodega\s+/i, '')}</p>}
      {description && <p className="product-modal__description">{description}</p>}
      <div className="product-modal__price"><span>{copy.official}</span><PriceDisplay priceARS={product.priceARS} currency={currency} language={language} className="price-display--modal" /></div>
      {pairing && <button className="pairing-cta" onClick={() => setPairingOpen(true)}><Icon name="grape" size={18}/><span>{copy.pairing}</span><Icon name="arrow" size={16}/></button>}
    </article>
    {pairingOpen && <PairingPanel pairing={pairing} winesById={winesById} language={language} currency={currency} onClose={() => setPairingOpen(false)} />}
  </div>;
}

function MenuItem({ product, language, currency, hasPairing, onOpen }) {
  const description = textFor(product.description, language);
  const detail = textFor(product.detail, language);
  const winery = textFor(product.winery, language);
  return <button className="menu-item" onClick={() => onOpen(product)} aria-label={`${textFor(product.name, language)}, ${formatARS(product.priceARS)}`}>
    <span className="menu-item__content">
      <strong>{textFor(product.name, language)}</strong>
      {hasPairing && <span className="menu-item__pairing"><Icon name="grape" size={12}/>{ui[language].pairing}</span>}
      {detail && <em>{detail}</em>}
      {winery && <small>{winery}</small>}
      {description && <span>{description}</span>}
    </span>
    <span className="menu-item__leader" aria-hidden="true" />
    <PriceDisplay priceARS={product.priceARS} currency={currency} language={language} className="menu-item__price" />
  </button>;
}

export default function DigitalMenu({ language, onReserve }) {
  const copy = ui[language];
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(menuData.categories[0].id);
  const [selected, setSelected] = useState(null);
  const validCurrencies = config.currency.available.filter(currency => currency === 'ARS' || isValidRate(config.currency.rates[currency]));
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('elp-currency') || config.currency.default;
    return saved === 'ARS' || isValidRate(config.currency.rates[saved]) ? saved : 'ARS';
  });
  const categoryNav = useRef(null);
  const categories = useMemo(() => [...menuData.categories, ...winesData.categories], []);
  const products = useMemo(() => {
    const categoryMap = Object.fromEntries(categories.map(category => [category.id, category.name]));
    return [...menuData.items, ...winesData.items].map(product => ({ ...product, categoryName: categoryMap[product.category] }));
  }, [categories]);
  const winesById = useMemo(() => {
    const categoryMap = Object.fromEntries(winesData.categories.map(category => [category.id, category.name]));
    return Object.fromEntries(winesData.items.map(wine => [wine.id, { ...wine, categoryName: categoryMap[wine.category] }]));
  }, []);
  const pairingsByProduct = useMemo(() => Object.fromEntries(pairingsData.pairings.flatMap(pairing => pairing.productIds.map(productId => [productId, pairing]))), []);
  const matching = useMemo(() => {
    if (!query.trim()) return products;
    const needle = normalize(query.trim());
    return products.filter(product => normalize([textFor(product.name, language), textFor(product.description, language), textFor(product.winery, language), textFor(product.detail, language)].join(' ')).includes(needle));
  }, [products, query, language]);
  const groups = useMemo(() => categories.map(category => ({ category, products: matching.filter(product => product.category === category.id) })).filter(group => group.products.length), [categories, matching]);

  useEffect(() => { localStorage.setItem('elp-currency', currency); }, [currency]);

  useEffect(() => {
    if (query) return;
    const sections = categories.map(category => document.getElementById(`menu-${category.id}`)).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (visible) setActive(visible.target.dataset.category);
    }, { rootMargin: '-145px 0px -58% 0px', threshold: [0, .1, .5] });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [categories, query]);

  useEffect(() => {
    categoryNav.current?.querySelector(`[data-nav="${active}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);

  const goToCategory = id => {
    setQuery(''); setActive(id);
    requestAnimationFrame(() => document.getElementById(`menu-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return <section className="digital-menu" id="carta">
    <div className="digital-menu__intro">
      <p className="eyebrow eyebrow--light"><span />{copy.eyebrow}</p>
      <h2>{copy.title}</h2>
      <p>{copy.subtitle}</p>
      <div className="menu-meta"><span>{products.length} {copy.products}</span><i /> <span>{categories.length} {copy.categories}</span></div>
    </div>

    <div className="menu-tools">
      <div className="menu-search">
        <Icon name="search" size={20}/>
        <label className="sr-only" htmlFor="menu-search">{copy.search}</label>
        <input id="menu-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={copy.search} autoComplete="off" />
        {query && <button onClick={() => setQuery('')} aria-label={copy.clear}><Icon name="close" size={17}/></button>}
      </div>
      <div className="currency-status" aria-label={copy.official}>
        {config.currency.available.map(option => {
          const enabled = validCurrencies.includes(option);
          return <button key={option} className={currency === option ? 'active' : ''} disabled={!enabled} title={enabled ? option : copy.unavailable} onClick={() => enabled && setCurrency(option)} aria-pressed={currency === option}>{option}</button>;
        })}
        {currency !== 'ARS' && <small>{copy.reference}{config.currency.exchangeRateUpdatedAt ? ` · ${copy.rateDate} ${config.currency.exchangeRateUpdatedAt}` : ''}</small>}
      </div>
    </div>

    {!query && <nav className="category-nav" ref={categoryNav} aria-label="Categorías de la carta">
      {categories.map(category => <button key={category.id} data-nav={category.id} className={active === category.id ? 'active' : ''} onClick={() => goToCategory(category.id)}>{textFor(category.name, language)}</button>)}
    </nav>}

    <div className={`menu-content ${query ? 'menu-content--searching' : ''}`}>
      {query && <div className="search-summary"><span>{matching.length} {matching.length === 1 ? copy.oneResult : copy.results}</span><button onClick={() => setQuery('')}>{copy.clear}</button></div>}
      {groups.map(({ category, products: groupProducts }, index) => <section className="menu-category" id={`menu-${category.id}`} data-category={category.id} style={{ '--category-index': index }} key={category.id}>
          <header className="menu-category__header">
            <span>{String(categories.findIndex(item => item.id === category.id) + 1).padStart(2,'0')}</span>
            <div><h3>{textFor(category.name, language)}</h3>{category.note && <p>{textFor(category.note, language)}</p>}{category.description && <p className="menu-category__description">{textFor(category.description, language)}</p>}</div>
            <small>{groupProducts.length}</small>
          </header>
          <div className="menu-category__items">{groupProducts.map(product => <MenuItem product={product} language={language} currency={currency} hasPairing={Boolean(pairingsByProduct[product.id])} onOpen={setSelected} key={product.id}/>)}</div>
          {!query && editorialBreaks[category.id] && <MenuEditorialBreak photoId={editorialBreaks[category.id]} language={language}/>}
      </section>)}
      {!matching.length && <div className="menu-empty"><span>LP</span><h3>{copy.emptyTitle}</h3><p>{copy.emptyText}</p><button onClick={() => setQuery('')}>{copy.clear}</button></div>}
    </div>
    <div className="menu-reserve-strip"><div><small>Estancia La Pasión</small><p>{copy.reservePrompt}</p></div><button onClick={onReserve}>{copy.reserve}<Icon name="arrow" size={17}/></button></div>
    <div className="menu-disclaimer"><span>✦</span><p>{copy.official}</p><strong>ARS</strong></div>
    <ProductModal product={selected} pairing={selected ? pairingsByProduct[selected.id] : null} winesById={winesById} language={language} currency={currency} onClose={() => setSelected(null)}/>
  </section>;
}
