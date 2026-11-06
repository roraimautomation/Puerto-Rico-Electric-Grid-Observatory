# SUR18 · Puerto Rico Electric Grid Observatory

Dashboard de capacidad instalada por planta y tecnología, basado en el inventario oficial **EIA-860M / Operating_PR**.

[Abrir dashboard](https://ra-sur18pr.bydproyectosca.chatgpt.site)

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

La revisión automática está **pendiente de activación**. La política es revisar las publicaciones mensuales de EIA y actualizar el inventario únicamente si cambia su contenido para Puerto Rico. Un nuevo mes o cambios fuera de Puerto Rico no generan una nueva versión. Ver [UPDATE_WORKFLOW.md](UPDATE_WORKFLOW.md) para el procedimiento. No se incluyen credenciales en el repositorio.

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

## Exploración y antigüedad

El segundo filtro permite ocultar y restaurar plantas después de filtrar por tecnología u operador. También se puede usar clic derecho → Ocultar, tecla Supr sobre un recuadro o arrastrar una planta hasta la zona de exclusión. Se recalculan las áreas y los totales; no se borran registros. La exclusión afecta todas las tecnologías de una misma planta.

La pestaña Antigüedad usa el año y mes de operación de cada unidad en Operating_PR, no la fecha de fundación de la central. Muestra rangos por planta, edad máxima, edad ponderada por MW, detalle por unidad y retiros reportados a EIA. Los años desconocidos no se infieren.

Los umbrales de revamping y decomisionamiento son escenarios ilustrativos editables por tecnología, no recomendaciones certificadas ni órdenes de retiro. La evaluación real depende de condición, historial, eficiencia, seguridad y necesidades de red. Los objetivos se calculan como año de operación más umbral. El CSV exporta los parámetros y resultados de la vista seleccionada.

La plataforma mantiene el segmento de cuenta en el dominio. La dirección operativa es https://ra-sur18pr.bydproyectosca.chatgpt.site ; el cambio de etiqueta no permite asignar por sí solo el dominio raíz ra-sur18pr.chatgpt.site.
