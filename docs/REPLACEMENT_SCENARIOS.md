# Explorador de sustitución de petróleo

La pestaña Escenarios usa las unidades de `Operating_PR` del inventario visible. Respeta búsqueda, tecnología, operador y exclusiones. No infiere carga base a partir del combustible: la selección inicial de Aguirre, San Juan y Palo Seco puede modificarse por planta o unidad. No modifica el inventario EIA.

## Referencia PR100

Fuente primaria: [PR100 Summary Report, febrero de 2024](https://www.energy.gov/sites/default/files/2024-08/CFE%20PR%20Grid%20Resilience%20and%20Transitions%20to%20100%20Renewable%20Energy.pdf), pp. 7–8, 17 y 22; PDF pp. 17–18, 28 y 33. [Informe final en español](https://www.nlr.gov/docs/fy24osti/88614.pdf).

Las tarjetas documentan capacidad solar distribuida total modelada para 2050: económica 2.500–3.300 MW, equitativa 2.800–3.600 MW y máxima 5.200–6.100 MW. Los intervalos responden a variantes de demanda. No son adiciones al inventario de septiembre de 2026. Operating_PR no es un censo completo del parque detrás del contador.

El preset «Solar distribuida · enfoque PR100» es una propuesta simplificada del dashboard, no un escenario numérico oficial de PR100. Las demás mezclas tampoco se atribuyen al estudio. Ningún costo o factor de planta inicial se presenta como parámetro de PR100: todos son hipótesis ilustrativas editables, sin validación como cotizaciones locales. El estudio original evalúa el sistema completo mediante modelos que este explorador no reproduce.

## Balance y costos

- Energía objetivo MWh/año = MW seleccionados × 8.760 × factor de planta supuesto × fracción sustituida. Puede reemplazarse la energía de toda la selección por GWh/año aportados por el usuario, aplicando después la fracción de sustitución. Ese dato debe revisarse si cambia la selección.
- Las participaciones solar, eólica y gas corresponden a energía entregada y suman 100%. La solar se divide entre centralizada y distribuida.
- Multiplicador de energía renovable bruta = `(1 − fracción almacenada + fracción almacenada / eficiencia de ciclo) / (1 − recorte)`. Capacidad por recurso = energía bruta / (8.760 × factor de planta). El gas no pasa por almacenamiento.
- Batería útil AC MWh = energía renovable entregada que se desplaza / 365. Se supone un ciclo diario medio. MW batería = MWh / duración de descarga. No se vuelve a sumar la descarga como generación. Esta relación no simula la disponibilidad horaria de carga.
- Inversión = MW generación × USD/kW × 1.000 + MWh batería útil AC × USD/kWh × 1.000. El costo de batería debe incluir el sistema necesario para entregar esa energía útil AC.
- Capital anualizado usa el factor de recuperación de capital `r / (1 − (1+r)^−n)`; a tasa cero usa `1/n`. Se aplican vidas económicas separadas a generación y batería.
- Costo anual nuevo parcial = capital anualizado + O&M fijo como porcentaje de inversión + costo variable de gas × energía de gas. El costo parcial por MWh divide por energía objetivo.
- Diferencia anual orientativa = costo variable evitado de petróleo − costo anual nuevo parcial. No es ahorro garantizado, tarifa minorista ni costo total del sistema. No se incluyen costos fijos existentes ni su evitabilidad.

No se modelan demanda, meteorología y despacho horarios, reservas, ELCC, fallas, huracanes, red, combustible, degradación, profundidad de descarga, impuestos, incentivos, terrenos, interconexión o demolición. Capacidad nominal, energía anual y potencia firme no son intercambiables. Este balance no justifica por sí solo ningún retiro ni identifica una solución de menor costo validada.

Los supuestos y cuatro capturas se guardan en localStorage del navegador. El JSON exporta unidades, periodo, supuestos, resultados, comparación de presets y capturas. Las capturas conservan el contexto original aunque cambie el inventario. No se guardan en el servidor ni en el repositorio del usuario automáticamente.

Validación del cálculo: `node --experimental-strip-types --test tests/replacement-scenarios.test.mjs`.
