# Plan de Acción — Sistema de Registro de Deudas y Recordatorios por WhatsApp

## 1. Visión general del proyecto

Aplicación web que permite a un usuario registrar personas que le deben dinero, definir esquemas de pago totalmente personalizables (cuota única, mensual, semanal, diaria, etc.), dar seguimiento a abonos parciales, visualizar quién lleva más tiempo debiendo, y generar recordatorios manuales vía WhatsApp (link `wa.me`) y notificaciones internas/por correo. Incluye generación de un "acuerdo de compromiso de pago" editable entre usuario y deudor.

**Stack tecnológico:**
- Backend: Node.js + Express (API REST, único punto de acceso a datos, incluye `/auth/register` y `/auth/login` como intermediarios hacia Supabase Auth)
- Base de datos: Supabase (PostgreSQL) — acceso vía consultas directas parametrizadas desde Express, sin ORM, con capas de sanitización/seguridad (similar al patrón usado en proyectos previos con SQLAlchemy pooling pero SQL directo)
- Frontend: React + Tailwind CSS
- Autenticación: Supabase Auth (email/password en MVP, OAuth Google como fase futura)
- Recordatorios: generación de links `wa.me/<numero>?text=<mensaje_urlencoded>` (sin API oficial de WhatsApp), envío manual por el usuario
- Notificaciones: in-app + correo (validando entregabilidad, evitar spam)

**Principio de arquitectura:** todo el tráfico pasa por la API Express (ni el frontend ni el usuario acceden directo a Supabase), priorizando escalabilidad y separación de responsabilidades.

---

## 2. Módulos y arquitectura general

1. Módulo de Autenticación (`/auth`)
2. Módulo de Gestión de Deudores (Contactos)
3. Módulo de Gestión de Deudas y Esquemas de Pago
4. Módulo de Abonos/Pagos
5. Módulo de Dashboard
6. Módulo de Recordatorios (WhatsApp + Notificaciones)
7. Módulo de Historial (tipo extracto bancario)
8. Módulo de Acuerdo de Compromiso de Pago (documento firmable)
9. Módulo de Configuración de Usuario
10. (Futuro / Backlog) Conexión entre usuarios de la plataforma

---

## 3. Historias de Usuario por Módulo

### Módulo 1: Autenticación

**HU-1.1** Como usuario nuevo, quiero registrarme con correo y contraseña para crear mi cuenta.
- Criterios de aceptación: endpoint `POST /auth/register`; valida formato de correo y fuerza de contraseña; delega la creación a Supabase Auth; retorna token de sesión.

**HU-1.2** Como usuario registrado, quiero iniciar sesión con correo y contraseña.
- Criterios de aceptación: endpoint `POST /auth/login`; retorna JWT/session token; manejo de errores de credenciales inválidas.

**HU-1.3** Como usuario autenticado, quiero cerrar sesión de forma segura.
- Criterios de aceptación: endpoint `POST /auth/logout`; invalida sesión en Supabase.

**HU-1.4 (Backlog)** Como usuario, quiero iniciar sesión con Google para agilizar el acceso.

---

### Módulo 2: Gestión de Deudores (Contactos)

**HU-2.1** Como usuario, quiero registrar una persona (nombre, teléfono, notas opcionales) como deudor.
- Criterios: teléfono en formato internacional válido para generar link de WhatsApp; nombre obligatorio; notas opcionales.

**HU-2.2** Como usuario, quiero editar o eliminar un deudor registrado.

**HU-2.3** Como usuario, quiero buscar y filtrar mi lista de deudores (por nombre, estado de deuda, días debiendo).

---

### Módulo 3: Gestión de Deudas y Esquemas de Pago

**HU-3.1** Como usuario, quiero crear una deuda asociada a un deudor con monto total y fecha de creación (obligatoria, automática).
- Criterios: fecha de inicio siempre registrada; fecha límite de pago es opcional.

**HU-3.2** Como usuario, quiero definir el esquema de pago de cada deuda (pago único, cuotas mensuales, semanales, diarias, o personalizado) de forma independiente por deuda.
- Criterios: tabla `payment_schedule` con tipo de frecuencia, monto por cuota, número de cuotas (si aplica); una deuda puede no tener fecha límite fija.

**HU-3.3** Como usuario, quiero editar el esquema de pago de una deuda existente (ej. cambiar de pago único a cuotas).

**HU-3.4** Como usuario, quiero ver cuántos días lleva cada deudor sin completar su deuda, ordenado de mayor a menor antigüedad.
- Criterios: cálculo automático `hoy - fecha_creación_deuda` mientras el estado sea "pendiente".

**HU-3.5 (Backlog)** Como usuario, quiero aplicar intereses o recargos por mora configurables.

---

### Módulo 4: Abonos y Pagos

**HU-4.1** Como usuario, quiero registrar un abono parcial a una deuda (monto menor al saldo total).
- Criterios: actualiza saldo pendiente; no permite abonos mayores al saldo restante; genera entrada en historial.

**HU-4.2** Como usuario, quiero marcar una deuda como completamente pagada.
- Criterios: cambia estado a "pagada"; registra fecha de cierre; genera entrada en historial.

**HU-4.3** Como usuario, quiero ver el saldo pendiente actualizado de cada deuda en tiempo real.

---

### Módulo 5: Dashboard

**HU-5.1** Como usuario, quiero ver un resumen general: total adeudado, número de deudores activos, deudas próximas a vencer.

**HU-5.2** Como usuario, quiero ver un listado ordenado por antigüedad de deuda (quién debe hace más tiempo).

**HU-5.3** Como usuario, quiero ver el detalle de una deuda específica: monto, esquema de pago, abonos realizados, fecha límite (si existe), días transcurridos.

---

### Módulo 6: Recordatorios (WhatsApp + Notificaciones)

**HU-6.1** Como usuario, quiero generar un mensaje de recordatorio pre-rellenado con los datos reales de la deuda (nombre, monto, fecha) para un deudor específico.
- Criterios: construcción de link `https://wa.me/<numero>?text=<mensaje_urlencoded>`; plantilla editable antes de generar el link.

**HU-6.2** Como usuario, quiero hacer clic en un botón "Enviar recordatorio" que abra WhatsApp Web/App con el mensaje ya listo para confirmar envío.
- Criterios: no se envía automáticamente, requiere clic final del usuario dentro de WhatsApp (limitación inherente de no usar la API oficial).

**HU-6.3** Como usuario, quiero recibir notificaciones dentro de la app cuando una deuda esté próxima a vencer o venza.
- Criterios: notificación in-app basada en fecha límite (si existe) o en frecuencia de cuota configurada.

**HU-6.4 (Backlog — fuera del MVP)** Como usuario, quiero recibir también un correo de recordatorio, validando que no caiga en spam (uso de dominio verificado, SPF/DKIM, proveedor confiable tipo Resend/SendGrid). Se descarta del MVP por la complejidad de verificar dominio y evitar spam; se prioriza notificación in-app.

**HU-6.5 (Opcional/Backlog)** Como usuario, quiero guardar un log de cada recordatorio enviado (fecha, deudor, mensaje) para trazabilidad.

---

### Módulo 7: Historial (tipo extracto bancario)

**HU-7.1** Como usuario, quiero ver un historial cronológico de movimientos por deudor: abonos, deudas creadas, deudas cerradas, recordatorios enviados.
- Criterios: vista tipo "movimientos de cuenta"; cada evento con fecha, tipo, monto (si aplica), descripción.

**HU-7.2** Como usuario, quiero filtrar el historial por tipo de evento o por rango de fechas.

---

### Módulo 8: Acuerdo de Compromiso de Pago

**HU-8.1** Como usuario, quiero generar un documento de compromiso de pago no oficial con una plantilla editable (nombres, monto, fecha, condiciones).
- Criterios: plantilla base en la app; campos dinámicos rellenados automáticamente desde los datos de la deuda; exportable (PDF o vista imprimible).

**HU-8.2** Como usuario, quiero que el deudor pueda "firmar" el acuerdo de alguna forma verificable.
- Criterios (a definir en refinamiento): opciones a evaluar — enlace único enviado al deudor donde ingresa su nombre + confirma con clic (firma simple no oficial), o captura de firma dibujada (canvas) desde el móvil del deudor, con timestamp e IP como respaldo simbólico. No sustituye una firma legal.

**HU-8.3 (Backlog)** Como usuario, quiero almacenar el estado del acuerdo (pendiente de firma, firmado) vinculado a la deuda.

---

### Módulo 9: Configuración de Usuario

**HU-9.1** Como usuario, quiero configurar mi número de WhatsApp y datos de contacto que aparecerán en los mensajes/documentos generados.

**HU-9.2** Como usuario, quiero personalizar la plantilla de mensaje de recordatorio y de acuerdo de compromiso.

---

### Módulo 10 (Backlog futuro): Conexión entre usuarios

**HU-10.1** Como usuario, quiero invitar a un deudor a crear su propia cuenta en la plataforma para que visualice su deuda directamente.

**HU-10.2** Como deudor-usuario, quiero ver cuánto debo y a quién, sin depender de mensajes externos.

---

## 4. Modelo de datos preliminar (entidades clave)

- `users` (gestionado por Supabase Auth)
- `debtors` (id, user_id, nombre, teléfono, notas, created_at)
- `debts` (id, debtor_id, monto_total, fecha_creación, fecha_límite [nullable], estado, saldo_pendiente)
- `payment_schedules` (id, debt_id, tipo_frecuencia, monto_cuota, num_cuotas)
- `payments` (id, debt_id, monto, fecha, tipo[abono/pago_total])
- `history_events` (id, user_id, debtor_id, debt_id, tipo_evento, descripción, fecha)
- `reminders_log` (id, debt_id, canal[whatsapp/email], mensaje, fecha_envío)
- `agreements` (id, debt_id, contenido, estado[pendiente/firmado], fecha_firma)

---

## 5. Priorización sugerida (MVP)

**Fase 1 (MVP core):** Módulos 1, 2, 3, 4, 5 (auth, deudores, deudas con esquemas personalizables, abonos, dashboard básico).

**Fase 2:** Módulo 6 (recordatorios WhatsApp + notificaciones in-app únicamente, sin correo), Módulo 7 (historial).

**Fase 3:** Módulo 8 (acuerdo de compromiso), Módulo 9 (configuración avanzada).

**Backlog / fase futura:** Módulo 10 (conexión entre usuarios), intereses por mora, OAuth Google, log de recordatorios, notificaciones por correo (Resend + verificación de dominio).

---

## 6. Decisiones tomadas sobre puntos abiertos

- **Firma del deudor**: se usará `signature_pad` (canvas HTML5, open source) con enlace único enviado por WhatsApp; como primera iteración simplificada, el deudor puede solo escribir su nombre + clic en "Acepto" antes de implementar el canvas.
- **Correo transaccional (Resend)**: se **descarta del MVP** por la complejidad de verificar dominio y evitar spam. Se deja documentado como backlog para fase futura. El MVP usa solo notificaciones in-app + `wa.me`.
- **Queries parametrizadas**: se usará `pg` (node-postgres) con prepared statements (`$1, $2...`), pooling de conexiones y transacciones, replicando el patrón de seguridad ya usado en proyectos previos con SQLAlchemy pero en SQL directo.
- **Roles/permisos para conexión entre usuarios** (Módulo 10): queda pendiente de definir, se aborda solo cuando ese módulo entre en desarrollo (fase futura, fuera del MVP).


---

## 7. Decisiones técnicas confirmadas (stack open source / gratuito)

### 7.1 Firma del deudor — `signature_pad`
- Librería open source (MIT License) basada en HTML5 canvas, permite dibujar firma con mouse o dedo y exportarla como imagen PNG/SVG en base64.
- Flujo: se genera un enlace único con token temporal enviado al deudor por WhatsApp; el deudor abre el enlace, ve el acuerdo, dibuja su firma y confirma.
- Se guarda la imagen de la firma + timestamp + IP en la tabla `agreements` como respaldo simbólico (no es firma legalmente vinculante).
- Alternativa más simple para una primera iteración: el deudor solo escribe su nombre completo y hace clic en "Acepto" (queda registrado con timestamp), evitando el canvas hasta una segunda iteración.

### 7.2 Correo transaccional — Resend (POSPUESTO, fuera del MVP)
- Se decide **no incluir notificaciones por correo en el MVP** para evitar la complejidad de verificar dominio propio, configurar SPF/DKIM/DMARC y gestionar reputación de entregabilidad en esta fase inicial.
- El MVP cubrirá recordatorios únicamente vía notificaciones in-app + generación de link `wa.me` para WhatsApp.
- Queda documentado como backlog para una fase posterior: Resend (gratis hasta 3,000 correos/mes) con dominio propio económico (Porkbun/Namecheap, ~1-10 USD/año) o subdominio gratuito con control DNS (`dpdns.org`, `afraid.org`) para verificación.

### 7.4 Queries parametrizadas — `pg` (node-postgres)
- Librería open source estándar para Express + PostgreSQL/Supabase.
- Soporta pooling de conexiones (`Pool`), transacciones (`BEGIN/COMMIT/ROLLBACK`) y consultas parametrizadas con placeholders (`$1, $2...`), evitando inyección SQL sin necesidad de un ORM completo.
- Replica el patrón de seguridad usado previamente con SQLAlchemy (pooling + transacciones) pero con SQL directo y sanitización explícita de inputs.

### 7.5 Resumen de herramientas

| Herramienta | Función | Costo |
|---|---|---|
| `pg` (node-postgres) | Pooling, transacciones, queries parametrizadas | Gratis, open source |
| `signature_pad` | Captura de firma en canvas | Gratis, open source |
| Resend | Envío de correos transaccionales | Gratis hasta 3,000/mes | -> Descartado para MVP
| Porkbun / dpdns.org | Dominio o subdominio para verificar Resend (backlog) | ~1-10 USD/año o gratis | -> Descartado para MVP
| `wa.me` links | Generación de mensajes WhatsApp | Gratis, sin API oficial |
