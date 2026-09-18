import photography from '../data/photography.json';

const photosById = Object.fromEntries(photography.photos.map(photo => [photo.id, photo]));

export default function RestaurantImage({ id, language = 'ES', className = '', decorative = false, loading = 'lazy', sizes = '100vw' }) {
  const photo = photosById[id];
  if (!photo) return null;
  const locale = language.toLowerCase();
  const fallback = photo.sources[0];
  const srcSet = photo.sources.map(source => `${source.src} ${source.width}w`).join(', ');
  return <picture className={className}>
    <source type="image/webp" srcSet={srcSet} sizes={sizes}/>
    <img
      src={fallback.src}
      srcSet={srcSet}
      sizes={sizes}
      alt={decorative ? '' : (photo.alt[locale] || photo.alt.es)}
      loading={loading}
      decoding="async"
      fetchPriority={loading === 'eager' ? 'high' : 'auto'}
    />
  </picture>;
}
