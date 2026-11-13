# SUR18 · Puerto Rico Electric Grid Observatory

Dashboard de capacidad instalada por planta y tecnología, basado en el inventario oficial **EIA-860M / Operating_PR**.

[Abrir dashboard](https://ra-sur18pr.bydproyectosca.chatgpt.site)

## Navegación

Cinco pestañas integradas: **Capacidad por planta**, **Inventario**, **Antigüedad**, **Escenarios** y **Generación Distribuida**. Las primeras cuatro utilizan el inventario EIA-860M; la quinta utiliza el informe trimestral LUMA Q1 2026 (expediente NEPR-MI-2019-0016). El histórico anterior a la quinta pestaña está preservado en la rama `archive/observatorio-3-pestanas-pre-gd-2026-11-08` (el nombre de la rama es histórico; contenía cuatro pestañas).

## Funciones

- Treemap con áreas proporcionales a MW y colores de las referencias SUR18.
- Inventario por planta, búsqueda, filtros por tecnología y operador.
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

El control «Mostrar u ocultar plantas» permite ocultar y restaurar plantas después de filtrar por tecnología u operador. También se puede usar clic derecho → Ocultar, tecla Supr sobre un recuadro o arrastrar una planta hasta la zona de exclusión. Se recalculan las áreas y los totales; no se borran registros. La exclusión afecta todas las tecnologías de una misma planta.

La pestaña Antigüedad usa el año y mes de operación de cada unidad en Operating_PR, no la fecha de fundación de la central. Muestra rangos por planta, edad máxima, edad ponderada por MW, detalle por unidad y retiros reportados a EIA. Los años desconocidos no se infieren.

Los umbrales de revamping y decomisionamiento son escenarios ilustrativos editables por tecnología, no recomendaciones certificadas ni órdenes de retiro. La evaluación real depende de condición, historial, eficiencia, seguridad y necesidades de red. Los objetivos se calculan como año de operación más umbral.

La plataforma mantiene el segmento de cuenta en el dominio. La dirección operativa es https://ra-sur18pr.bydproyectosca.chatgpt.site ; el cambio de etiqueta no permite asignar por sí solo el dominio raíz ra-sur18pr.chatgpt.site.

## Escenarios de sustitución de petróleo

La pestaña **Escenarios** permite seleccionar unidades, definir energía objetivo, ajustar costos y factores de planta y comparar solar centralizada, solar distribuida con enfoque PR100, mezcla solar/eólica y transición con gas. Distingue capacidad MW, energía GWh y almacenamiento MW/MWh. Incluye referencias oficiales de PR100 a 2050 y guardado local de cuatro escenarios. Los presets no reproducen PR100 y los supuestos iniciales son ilustrativos; el balance anual y los costos parciales no prueban suficiencia horaria ni autorizan retiros. Método, alcance y fuentes: [docs/REPLACEMENT_SCENARIOS.md](docs/REPLACEMENT_SCENARIOS.md).

## Usabilidad del observatorio

- No se ofrecen funciones de exportación CSV o JSON ni un botón de revisión manual de la fuente en las pestañas del observatorio.
- «Resultados de la selección» identifica búsqueda, tecnología, operador y plantas ocultas. Los indicadores cuentan todas las tecnologías de las plantas seleccionadas; el gráfico conserva el filtro por tecnología.
- «Restablecer toda la vista» borra búsqueda, tecnología, operador, exclusiones y ordenación; mantiene la pestaña actual y los supuestos de escenarios.
- «Ver lista legible de plantas» ofrece nombres completos y capacidades, también para plantas cuyo recuadro es pequeño.
- Las fichas usan un diálogo modal nativo, recorrido circular del teclado, cierre con Escape y recuperación del foco.
- Los escenarios guardados permanecen en el navegador; se informa si no se pueden guardar.
