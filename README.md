# SUR18 · Puerto Rico Electric Grid Observatory

Dashboard de capacidad instalada por planta y tecnología, basado en el inventario oficial **EIA-860M / Operating_PR**.

[Abrir dashboard](https://sur18-puerto-rico-energia.bydproyectosca.chatgpt.site)

## Funciones

- Treemap con áreas proporcionales a MW y colores de las referencias SUR18.
- Inventario por planta, búsqueda, filtros por tecnología y operador, exportación CSV.
- Fichas con ID EIA, generadores, capacidad por tecnología y ubicación.
- Tooltips de la leyenda con definición, MW y número de plantas; funcionan con ratón, teclado y toque.
- Baterías separadas de la generación. Una planta con varias tecnologías se cuenta una sola vez.
- Copia oficial inicial: septiembre de 2026, 67 plantas, 228 generadores, 6.436,1 MW de generación y 38,2 MW de baterías.

## Fuente y actualización

Fuente: https://www.eia.gov/electricity/data/eia860m/

La EIA publica datos mensuales. El servidor conserva el último inventario validado en D1. `POST /api/import` recibe el Excel oficial y valida el período, la firma del archivo, la hoja Operating_PR y el número de plantas antes de guardar. `GET /api/inventory` devuelve el inventario persistido.

La revisión semanal está **pendiente de activación** porque la cuenta alcanzó el límite de cinco tareas programadas. No hay una tarea semanal activa para este dashboard. Ver [UPDATE_WORKFLOW.md](UPDATE_WORKFLOW.md) para el procedimiento. No se incluyen credenciales en el repositorio.

## Desarrollo

Requiere Node.js 22.13 o posterior.

```bash
npm ci
npm run dev
```

```bash
npx tsc --noEmit
npm run build
```

Runtime: React 19, Vinext/Vite, Cloudflare Workers, D1 y Drizzle. El despliegue privado y su autenticación son administrados por Sites. Las operaciones de escritura se apoyan en esa frontera de acceso; no se debe desplegar como sitio público sin añadir autorización al servidor.

## Archivos principales

- `app/page.tsx`, `app/globals.css`: dashboard y diseño adaptable.
- `components/legend-tooltip.tsx`: tooltips accesibles de la leyenda.
- `lib/inventory.ts`: categorías, siglas y normalización.
- `lib/server-inventory.ts`: importación y persistencia.
- `data/seed.json`: inventario inicial reproducible.
- `drizzle/`: migración de la base de datos.
- `references/`: imágenes de diseño proporcionadas por el usuario.
- `docs/RUNTIME.md`: documentación del runtime y desarrollo local.

Las cifras representan capacidad nominal instalada, no generación instantánea ni disponibilidad operativa.
