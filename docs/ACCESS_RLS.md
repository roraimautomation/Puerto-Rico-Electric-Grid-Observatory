# Acceso con cuenta y RLS — muestra local

Estado: versión candidata 0.2.0-rc.1 en una rama separada para revisión. Sin despliegue, sin cambios de audiencia ni migración de producción. La versión anterior queda conservada en `archive/observatorio-pre-auth-rls-2026-11-15`. Base: versión publicada 13, commit `3f9d50372f2ae3626b5931b7dc71318eba3618f1`.

## Comportamiento

La dirección pública muestra `/acceso`; inventario y generación distribuida requieren cuenta aprobada. La cuenta nueva se registra como `reader/pending` mediante un trigger, sin confiar en metadatos del usuario. Confirmar correo no aprueba el acceso. Supabase Auth gestiona las contraseñas. La aplicación utiliza exclusivamente una clave publicable y el JWT del usuario para las consultas: no usa `service_role`.

| Recurso | Anónimo / pendiente / suspendido | Consulta aprobada | Administradora aprobada | Servicio updater aprobado |
|---|---|---|---|---|
| Inventario | Sin acceso | Leer | Leer; escribir con MFA | Leer y escribir |
| Escenarios | Sin acceso | CRUD propios | CRUD propios; nunca ajenos | Sin acceso |
| Cuenta | Solo su fila si está autenticado | Leer propia | Leer cuentas con MFA | Leer propia |
| Aprobar/suspender | No | No | Solo lectores, con MFA y RPC limitada | No |
| Auditoría | No | No | Leer, con MFA | No |

Las API validan la sesión contra Auth y la membresía actual; RLS vuelve a comprobar permisos. `/api/import`, `/api/refresh` y `/mcp` no se basan en la privacidad de Sites para autorizar escrituras. Cookies: `__Host-`, Secure, HttpOnly, SameSite=Strict, duración máxima una hora. No se renueva sesión automáticamente: al expirar se debe volver a entrar. Las operaciones del navegador exigen Origin exacto. Los endpoints de importación y MCP también aceptan JWT Bearer de una cuenta autorizada; la credencial de bypass de Sites no concede permiso de escritura.

No hay una excepción de administradora para escenarios ajenos. El propietario de PostgreSQL y credenciales con BYPASSRLS tienen facultades de infraestructura diferentes: no deben usarse en la aplicación. Las suspensiones se consultan en la base en cada operación y bloquean datos aun con JWT previo. Auditoría registra actor, hora, operación, recurso e identificador, sin copiar contraseñas ni escenarios. Solo triggers confiables escriben auditoría. Hasta cuatro escenarios por cuenta; cuota aplicada en PostgreSQL con bloqueo por propietario para serializar inserciones.

## Muestra

`/muestra` existe únicamente en desarrollo (`import.meta.env.DEV`); en compilación de producción devuelve 404. Ofrece acceso ilustrativo, dashboard con copia EIA de septiembre y aprobación/suspensión simulada. No llama a Auth ni guarda datos en Supabase. No introducir credenciales reales.

## Activación pendiente, después de revisar la muestra

1. Crear/seleccionar un proyecto Supabase de staging y decidir región, proveedor SMTP, canal de contacto de privacidad y plazos de conservación. No se crearon servicios, cuentas ni costos externos.
2. Aplicar `supabase/migrations/202611150001_access_rls.sql` en una base nueva. No ejecutar sobre tablas existentes sin revisar conflictos y migración. Mantener `private` fuera de esquemas expuestos por la Data API; exponer `public` con RLS.
3. Configurar Auth con confirmación de correo, mínimo 12 caracteres, controles de abuso/rate limits y SMTP. Las plantillas Signup y Recovery deben mostrar `{{ .Token }}` para los formularios de código, no depender de un enlace implícito. Probar envío y confirmación.
4. Crear la cuenta administradora en Auth, confirmar su email y elevar **su UUID verificado** desde SQL de confianza: `update public.members set role='admin',status='approved' where user_id='<UUID_VERIFICADO>';`. No se elige administradora por email enviado por el navegador. Entrar en `/admin`, configurar TOTP y verificar antes de gestionar cuentas. Preparar un procedimiento de recuperación de MFA fuera de la aplicación.
5. Configurar únicamente `SUPABASE_URL=https://<project-ref>.supabase.co` y `SUPABASE_PUBLISHABLE_KEY` en el runtime de staging. La clave puede ser `sb_publishable_...` o la antigua `anon`. Nunca `service_role`, `sb_secret_...` ni contraseñas de base de datos. La aplicación rechaza claves privilegiadas conocidas.
6. Extraer el snapshot vigente de D1 en modo lectura y cargarlo en `public.snapshots` conservando su payload y período. Verificar totales y fechas contra D1 antes de cambiar el tráfico. El código conserva el baseline EIA para una base vacía solo después de autenticar al usuario. No elimina ni modifica D1. No copiar automáticamente el localStorage de un navegador compartido a una cuenta.
7. Si se necesitan actualizaciones automáticas, provisionar una cuenta de servicio separada con rol `updater/approved`, guardar sus credenciales fuera del repositorio y conectar la tarea explícitamente. La automatización actual sigue sin activarse; no basta el bypass de Sites. El servicio no puede leer escenarios ni aprobar cuentas.
8. Probar en staging: registro, correo, aprobación, inicio/cierre/expiración de sesión, recuperación de contraseña por código, MFA, escenarios propios en dos cuentas, suspensión con sesión abierta, importación y MCP autorizados/no autorizados. Verificar cabeceras de identidad de Sites y no depender de ellas para Supabase. Revisar el aviso de privacidad antes de publicarlo como política definitiva.
9. Tras aprobación de la usuaria: sincronizar GitHub, compilar y desplegar; entonces cambiar audiencia a pública. Hasta ese momento el sitio publicado conserva su acceso privado.

## Verificación local

- `npx tsc --noEmit`
- `npm test`: 36 pruebas aprobadas (incluye 17 pruebas de handlers HTTP con Supabase simulado).
- `npm install --prefix supabase/tests --ignore-scripts --no-audit --no-fund` y `npm run test:rls` (PGlite 0.5.16): 9 pruebas de políticas, grants y triggers aprobadas.
- `npm run build` (en este checkout los scripts shell heredados no eran ejecutables; se usa `SITES_ENV_READY=1 SITES_PROJECT_ROOT=<checkout> npm run build` para la comprobación local).

Las pruebas RLS ejecutan PostgreSQL real mediante PGlite, con roles y funciones `auth.uid/auth.jwt` mínimas simuladas. Comprueban políticas, grants, triggers, cuota y RPC; no sustituyen pruebas de integración con Supabase Auth/SMTP/MFA en staging. No se ha aplicado SQL a la base de producción ni probado autenticación real.

La revisión adicional corrigió el procesamiento de escrituras PostgREST exitosas con cuerpo vacío (201/204) y evita consultar cuotas ajenas antes de validar al propietario del escenario. GitHub Actions repite pruebas y compilación sin desplegar.
