# Estancia La Pasión — PWA

Base visual y técnica mobile-first para la experiencia gastronómica digital de **Estancia La Pasión**, Mendoza.

## Fases 1 a 7

Esta entrega incluye:

- SPA responsive con dirección visual premium.
- Carta digital oficial con 140 productos o variantes y 29 categorías.
- Datos gastronómicos y vinos desacoplados en archivos JSON mantenibles.
- Buscador instantáneo por nombre, descripción, bodega y presentación.
- Navegación horizontal sticky con seguimiento de categoría activa.
- Detalle de producto compacto y accesible para teléfonos.
- Experiencia editorial mobile-first y navegación rápida inferior.
- Sistema de componentes reutilizables (`Button`, `Eyebrow`, `Reveal`, modales, navegación y accesos rápidos).
- Idiomas ES / EN / PT con fallback fiel al texto disponible en la carta oficial.
- Precios oficiales en ARS y conversor centralizado para USD/BRL, que se habilita únicamente con tasas válidas.
- Sommelier digital para 19 platos relevantes, con dos vinos reales de la carta por maridaje.
- Relaciones de maridaje desacopladas en `src/data/pairings.json` y validadas contra los IDs oficiales.
- Persistencia local —sin datos personales— de idioma y moneda seleccionados.
- Flujo de solicitud de reserva en tres pasos: datos, resumen y preparación de WhatsApp.
- Validación local de fechas, horarios de 12:00 a 23:30 y cantidad de personas.
- Mensajes de reserva localizados en ES / EN / PT enviados al WhatsApp oficial, sin backend ni almacenamiento.
- Asistencia en mesa por WhatsApp para llamar al mozo, pedir la cuenta u otra consulta.
- Validación del número de mesa y mensajes de asistencia localizados, sin persistencia de datos.
- Feedback privado de 1–3 estrellas por WhatsApp y acceso opcional a Google para todas las puntuaciones.
- Enlaces oficiales de Google Maps e Instagram centralizados en configuración.
- Incentivo social configurable y desactivado hasta recibir confirmación comercial.
- Nueve fotografías reales integradas como contenido editorial, sin asociaciones comerciales a productos.
- Originales preservados y derivados WebP responsive con carga diferida fuera del hero.
- Manifest, iconos instalables y service worker con estrategia actualizada para imágenes.
- Animaciones sutiles con soporte para `prefers-reduced-motion`.

No incluye reservas, sommelier, asistencia, reseñas ni integraciones externas.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible por defecto en `http://localhost:5173`.

## Producción

```bash
npm run build
npm run preview
```

El service worker se registra únicamente en builds de producción para evitar caché conflictiva durante desarrollo.

## Estructura

```text
src/
  components/       componentes UI y navegación
  data/             configuración, traducciones y esquemas de contenido
  App.jsx           composición editorial de la SPA
  styles.css        sistema visual y responsive
public/
  images/restaurant/      originales fotográficos preservados
  images/restaurant/web/  derivados WebP responsive
  icons/                  identidad PWA
  manifest.webmanifest
  sw.js
```

El inventario y los textos alternativos se mantienen en `src/data/photography.json`. Las fotografías no están asociadas a productos concretos de la carta.
