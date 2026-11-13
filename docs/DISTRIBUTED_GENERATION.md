# Generación distribuida — LUMA Q1 2026

## Alcance
Seis secciones: resumen, heatmap sector/rango, crecimiento, interconexión, balance energético y participación renovable. Ruta `/generacion-distribuida`, enlazada desde el observatorio. Primera carga estática reproducible; no altera la base EIA ni D1.

## Fuente y control
LUMA, Informe de Progreso de Interconexión de Sistemas de Generación Distribuida, trimestre enero–marzo 2026, presentado al NEPR (NEPR-MI-2019-0016), 15 mayo 2026, recibido 21 mayo. Tabla inventario p. 8: residencial 201,576; comercial 5,017; industrial 61; gubernamental/agrícola 178; total 206,832. Resumen p. 5: más de 201,125 clientes solares; es otra definición. Capacidad GD total 1,561 MW, no residencial. Energía exportada 254,515 MWh (p. 24). Activaciones 9,830 (p. 5/11). Para Q1 2026 energía renovable total 369,765 MWh, de los cuales 115,250 MWh corresponden a PPOA (p. 24).

Los datos del heatmap son número de proyectos, no potencia exacta por rango. El rango 0–100 kW no debe confundirse con el umbral de solicitudes expeditas <25 kW. El informe no aporta distribución municipal ni inventario off-grid. No confundir exportación con generación total detrás del contador. Los valores de solicitudes pendientes y activaciones son series diferentes y no deben sumarse.

## Actualización trimestral semiautomática — especificación, no activada
1. Revisar expediente público NEPR-MI-2019-0016 trimestralmente para detectar nuevos informes de LUMA.
2. Descargar el PDF con hash SHA-256 y conservar fecha de corte, publicación, URL y páginas.
3. Extraer a un archivo candidato estructurado, sin sobrescribir datos publicados.
4. Validar: total de sectores = total de inventario, sumas de rangos, valores no negativos, unidades MW/MWh, continuidad temporal, discrepancias entre clientes y proyectos, variaciones extremas.
5. Producir un diff de cifras y un reporte de anomalías para revisión de ingeniería.
6. Solo tras aprobación explícita, importar versión validada a D1 y habilitarla en la UI; conservar histórico y rollback.

**Esta rama no implementa un detector programado, ni extracción automática de PDF, ni escrituras a D1.** Esos componentes quedan como siguiente etapa revisable. No se han configurado secretos ni jobs.

## Revisión y pruebas pendientes
- Ejecutar `npx tsc --noEmit`, `npm run build` y pruebas manuales en entorno local antes de fusionar.
- Probar los 4 sectores × 10 rangos, selección de celda, escala sector/global, reinicio y navegación móvil.
- Verificar valores contra el PDF original y accesibilidad de controles.
- Confirmar que la navegación existente, el inventario EIA y los escenarios no cambian.
- No fusionar ni desplegar sin autorización.
