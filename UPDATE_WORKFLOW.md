# SUR18 · Actualizar solo ante cambios en Puerto Rico

Fuente canónica: https://www.eia.gov/electricity/data/eia860m/, hoja Operating_PR. EIA publica mensualmente. Revisar nuevas publicaciones mensuales, no generar publicaciones semanales.

Comparar el contenido de Puerto Rico con el inventario persistido: ID y nombre de planta, operador, municipio, ubicación, número de generadores y capacidad por tecnología. Ignorar el orden de las filas, el cambio de mes y los cambios en otros territorios.

Si no hay diferencias, conservar período, datos publicados, fecha de importación e historial. Registrar únicamente la fecha de revisión y permanecer en silencio. Si existen diferencias, guardar el nuevo inventario validado, añadir una sola entrada al historial e informar los cambios. Las baterías siguen separadas de la generación. No republicar el código del Site para cambios de datos.

## Acceso desatendido

Obtener current_live_url y el acceso de servicio con get_site para el Site vinculado. Descargar el Excel mensual oficial en la tarea; EIA puede devolver HTML a los servidores de alojamiento. Enviar el binario a POST /api/import?period=YYYY-MM&source=URL_ENCODED_EIA_XLSX_URL con Content-Type application/octet-stream y OAI-Sites-Authorization: Bearer usando el acceso de servicio. No guardar ni mostrar credenciales.

El endpoint valida origen, período, firma del archivo, hoja Operating_PR y número de plantas. Devuelve changed=false sin crear una nueva versión del inventario cuando el contenido es idéntico. Consultar GET /api/inventory con el mismo acceso para confirmar la persistencia. Conservar la última versión válida si falla la descarga o la validación. Mantener el Site privado.

La revisión automática permanece pausada hasta que pueda activarse una programación. No crear tareas duplicadas ni reactivar una tarea pausada sin autorización.
