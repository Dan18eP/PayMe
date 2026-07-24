# Arquitectura del Proyecto v3 — Architecture.md

Sistema de Registro de Deudas y Recordatorios por WhatsApp
Stack: React + Tailwind (TypeScript) | Express (TypeScript) | Supabase (PostgreSQL + Auth) | Drizzle ORM | Zod

Referencia: complementa `plan_accion_deudas_v2.md` (alcance funcional) y `rules.md` (flujo de trabajo y DoD). Esta versión reemplaza a `architecture_v2.md` tras evaluar el control de queries: se sustituye el query builder de `supabase-js` por **Drizzle ORM** en la capa de acceso a datos, manteniendo Supabase como proveedor de Postgres y de Auth.

---

## 1. Documento de Decisión Arquitectónica (ADR)

### 1.1 Stack tecnológico seleccionado

| Capa | Tecnología |
|---|---|
| Frontend | React + Tailwind CSS + TypeScript (Vite) |
| Backend / API Gateway | Express + TypeScript |
| Base de datos | Supabase (PostgreSQL), conexión vía Connection Pooler |
| Autenticación | Supabase Auth |
| ORM / acceso a datos | Drizzle ORM + drizzle-kit (migraciones) |
| Tipado y validación | TypeScript (estático) + Zod (runtime) |

### 1.2 Patrón arquitectónico: Arquitectura tradicional con API Gateway

```
React (Cliente) ──HTTP──> Express (Lógica de negocio + validación) ──Drizzle ORM──> Supabase (PostgreSQL)
                                          └──Supabase Auth SDK (admin)──> Supabase Auth
```

Express sigue siendo el único punto de entrada a los datos. El frontend nunca se comunica directo con Supabase.

### 1.3 Decisión clave de esta versión: Drizzle ORM en lugar de supabase-js query builder

Se evaluaron ambas opciones priorizando **control real de queries y tipado robusto**:

| Aspecto | supabase-js (query builder) | Drizzle ORM (elegido) |
|---|---|---|
| Control de queries | Sintaxis embebida propia, JOINs complejos incómodos | Sintaxis casi idéntica a SQL, control total |
| Tipado en joins profundos | Puede fallar ("Type instantiation excessively deep") | Inferencia de tipos confiable incluso en relaciones complejas |
| Migraciones | Dependientes del dashboard/SQL manual de Supabase | CLI propia (`drizzle-kit generate` + `migrate`), esquema como código versionado |
| Transacciones multi-tabla | Limitadas | Soporte real de transacciones SQL (`db.transaction(...)`) |
| Compatibilidad con Supabase | Nativa | Total, vía Connection Pooler de Supabase |

Supabase se mantiene como proveedor de Postgres (hosting, backups, pooler) y como servicio de Auth (registro/login). Drizzle reemplaza únicamente **cómo el backend se conecta y consulta la base de datos**.

---

## 2. Capas y flujo de una petición

```
Cliente (React + TS)
   ↓ HTTP
Route (Express)
   ↓
Middleware (auth + validación Zod)
   ↓
Controller
   ↓
Service (lógica de negocio)
   ↓
Repository (Drizzle ORM)
   ↓
Supabase (PostgreSQL vía Connection Pooler)
```

Regla de oro (sin cambios): **el router no sabe de negocio, el service no sabe de HTTP, el repository no sabe de reglas de negocio.**

---

## 3. Estrategia de tipado y validación

### 3.1 Zod — validación en tiempo de ejecución
- Ubicado en el middleware de Express (`validate.middleware.ts`): valida `req.body`/`params`/`query` antes del controller.
- Uso secundario en formularios de React para feedback instantáneo (la validación definitiva siempre ocurre en backend).
- Los schemas viven en `/validators`; se puede inferir el tipo TS con `z.infer<typeof schema>`.

### 3.2 TypeScript + Drizzle — tipado estático end-to-end
- El esquema de las tablas se define en código con Drizzle (`schema.ts`), usando su sintaxis de definición de tablas TypeScript.
- Desde ese mismo schema, Drizzle infiere automáticamente los tipos de retorno de cada query (`select`, `insert`, `update`) — no se necesita generar tipos por separado como con la CLI de Supabase.
- Cualquier cambio en el schema de Drizzle que no se refleje en el código de negocio se detecta como error de compilación.

---

## 4. Estructura de carpetas — Backend (Express + TypeScript + Drizzle)

```
/src
  /db
    schema.ts                 -> definición de tablas con Drizzle (fuente única de verdad)
    client.ts                 -> instancia de Drizzle conectada al pooler de Supabase
    /migrations                -> migraciones generadas por drizzle-kit

  /routes
    auth.routes.ts
    debtors.routes.ts
    debts.routes.ts
    payments.routes.ts
    reminders.routes.ts
    agreements.routes.ts
    dashboard.routes.ts
    index.ts

  /controllers
    auth.controller.ts
    debtors.controller.ts
    debts.controller.ts
    payments.controller.ts
    reminders.controller.ts
    agreements.controller.ts
    dashboard.controller.ts

  /services
    auth.service.ts
    debtors.service.ts
    debts.service.ts
    payments.service.ts
    reminders.service.ts
    agreements.service.ts
    dashboard.service.ts

  /repositories
    debtors.repository.ts      -> queries Drizzle sobre la tabla debtors
    debts.repository.ts
    payments.repository.ts
    history.repository.ts
    agreements.repository.ts

  /middlewares
    auth.middleware.ts         -> valida JWT de Supabase Auth
    validate.middleware.ts     -> aplica schemas Zod genéricos
    errorHandler.middleware.ts

  /validators
    debtors.schema.ts
    debts.schema.ts
    payments.schema.ts
    agreements.schema.ts

  /utils
    whatsappLink.util.ts
    dateHelpers.util.ts
    signatureToken.util.ts

  /config
    supabaseAuthAdmin.ts        -> cliente admin de Supabase solo para Auth
    env.ts

  app.ts
  server.ts

drizzle.config.ts               -> configuración de drizzle-kit (dialect, credenciales, carpeta de migraciones)
```

Nota importante: Supabase Auth se sigue usando mediante el SDK oficial (`@supabase/supabase-js`) **exclusivamente para autenticación** (registro, login, verificación de JWT); toda consulta a las tablas de negocio (deudores, deudas, pagos, historial, acuerdos) pasa por Drizzle.

---

## 5. Estructura de carpetas — Frontend (sin cambios respecto a v2)

```
/src
  /features
    /auth
    /debtors
    /debts
    /reminders
    /dashboard
  /components
  /layouts
  /hooks
  /pages
  /services
    httpClient.ts
  /store
  /utils
  /types
```

---

## 6. Flujo de datos seguro — paso a paso

1. **Formulario (React + TS)**: usuario ingresa datos; Zod da feedback instantáneo de formato.
2. **Petición HTTP**: viaja hacia Express vía `httpClient.ts`.
3. **Filtro Zod en Express**: `validate.middleware.ts` valida el payload; si es inválido, responde `400` sin llegar al controller.
4. **Controller → Service**: el controller delega la operación al service correspondiente.
5. **Service aplica reglas de negocio**: ej. valida que un abono no exceda el saldo pendiente.
6. **Repository con Drizzle**: ejecuta la query tipada contra Postgres (Supabase), dentro de una transacción si la operación toca varias tablas.
7. **Respuesta**: el controller devuelve el resultado con el status HTTP correspondiente.

---

## 7. Transacciones multi-tabla (resuelto en esta versión)

El punto que quedó pendiente en v2 (transacciones para operaciones como abono + actualización de saldo + registro en historial) se resuelve nativamente con Drizzle:

```ts
await db.transaction(async (tx) => {
  await tx.insert(payments).values({...});
  await tx.update(debts).set({ balance: newBalance }).where(eq(debts.id, debtId));
  await tx.insert(historyEvents).values({...});
});
```

Si cualquier paso falla, Drizzle revierte automáticamente toda la transacción (`ROLLBACK`), garantizando consistencia — esto ya no depende de una función RPC de Supabase como se planteaba como riesgo en v2.

---

## 8. Migraciones con drizzle-kit

1. Se modifica `db/schema.ts` (ej. se agrega una tabla o columna nueva).
2. Se genera la migración: `npx drizzle-kit generate`.
3. Se aplica contra Supabase: `npx drizzle-kit migrate`.
4. El historial de migraciones queda versionado en `/db/migrations`, permitiendo rastrear cada cambio de esquema en el control de versiones (Git), alineado con la regla 6 de `rules.md` (documentación viva).

---

## 9. Manejo de errores

- Se mantiene la clase `AppError` (con subtipos `InsufficientBalanceError`, `NotFoundError`, `UnauthorizedError`), lanzada desde los services y capturada por `errorHandler.middleware.ts`.
- Nunca se exponen al cliente detalles internos (stack traces, mensajes crudos de Postgres/Drizzle).

---

## 10. Próximos pasos de implementación

1. Inicializar frontend con Vite (`react-ts`).
2. Configurar backend Express con TypeScript y `tsx`/`ts-node-dev`.
3. Instalar `drizzle-orm`, `drizzle-kit`, y el driver de Postgres (`postgres` o `pg`) para la conexión vía el Connection Pooler de Supabase.
4. Instalar `@supabase/supabase-js` únicamente para el módulo de Auth.
5. Definir `db/schema.ts` con las tablas iniciales (debtors, debts, payment_schedules, payments, history_events, agreements).
6. Configurar `drizzle.config.ts` y generar la primera migración.
7. Crear el middleware genérico de validación con Zod.

---

## 11. Resumen de la regla de oro

| Capa | Sabe de HTTP | Sabe de negocio | Sabe de persistencia |
|---|---|---|---|
| Route | Sí | No | No |
| Middleware | Sí | No (solo validación estructural con Zod) | No |
| Controller | Sí | No | No |
| Service | No | Sí | No |
| Repository | No | No | Sí (Drizzle ORM) |
