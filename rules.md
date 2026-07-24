# Reglas de Acción del Proyecto — Rules.md

Proyecto: Sistema de Registro de Deudas y Recordatorios por WhatsApp
Modalidad: Desarrollo individual (solo developer)
Referencia: ver `plan_accion_deudas_v2.md` para contexto de módulos, historias de usuario y decisiones técnicas.

---

## 1. Revisión de contexto antes de proponer

- Antes de proponer cualquier cambio, código o nueva funcionalidad, se debe revisar primero el contenido de los `.md` del proyecto (plan de acción, este `rules.md`, y cualquier documentación técnica existente en `/docs` como architecture_v3.md).
- Si una tarea nueva no está contemplada en el plan de acción, se debe identificar en qué módulo o historia de usuario encaja, o proponer si amerita un módulo/HU nuevo antes de escribir código.
- No se asume contexto: si algo no está documentado o es ambiguo, se pregunta antes de actuar (ver regla 3).

## 2. Evaluar antes de desarrollar

- Antes de implementar, se debe evaluar viabilidad técnica, impacto en el sistema y alternativas de enfoque (ej. patrones de diseño, ubicación de la lógica, librerías a usar).
- Se prioriza siempre la opción que:
  - Sea más simple de mantener a largo plazo.
  - Respete el stack ya definido (Node.js + Express, React + Tailwind, Supabase/Postgres, `pg`, `signature_pad`, sin ORM pesado).
  - No introduzca dependencias innecesarias o de pago sin justificación clara.
- Toda propuesta debe presentarse antes de codificar: qué se va a hacer, por qué, y qué alternativas se consideraron.

## 3. Preguntar y pedir confirmación

- Ante cualquier duda sobre requerimientos, alcance, o decisiones de diseño, se pregunta antes de asumir.
- Si una tarea requiere modificar un endpoint, tabla, o archivo ya existente, se debe pedir confirmación explícita antes de tocarlo.
- Nunca se debe interpretar el silencio como aprobación tácita en decisiones estructurales (modelo de datos, arquitectura, contratos de API).

## 4. No eliminar código sin autorización (adaptado a modo solo)

- Aunque el desarrollo ahora es individual, se mantiene la disciplina de no eliminar ni sobrescribir código o lógica existente sin antes revisar por qué existe y qué función cumple.
- Si se detecta código obsoleto, duplicado o que debe refactorizarse, se debe señalar explícitamente antes de modificarlo (documentar en el commit o en un comentario temporal tipo `// TODO: revisar/eliminar - motivo`).
- Antes de un cambio estructural grande (ej. cambiar el modelo de datos o mover lógica de router a service), se debe dejar constancia en el `.md` correspondiente o en un changelog.

## 5. Seguridad como prioridad constante

- Toda entrada de usuario debe validarse y sanitizarse antes de llegar a la base de datos (uso obligatorio de queries parametrizadas con `pg`, nunca concatenación de strings en SQL).
- Las credenciales, tokens y llaves de Supabase/Resend/etc. se manejan siempre por variables de entorno (`.env`), nunca hardcodeadas ni versionadas en el repositorio.
- Los endpoints deben validar autenticación (JWT/session de Supabase Auth) y autorización (que el usuario solo acceda a sus propios deudores/deudas) en cada request sensible.
- Los enlaces únicos de firma de acuerdos (Módulo 8) deben usar tokens con expiración, no IDs secuenciales predecibles.
- Nunca exponer detalles internos de errores (stack traces, queries SQL) en las respuestas de la API; usar mensajes de error controlados.

## 6. Documentación viva

- Al terminar de desarrollar un endpoint o funcionalidad, se debe actualizar la documentación técnica correspondiente (README, Swagger/OpenAPI si aplica, y los `.md` del plan de acción si la implementación difiere de lo planeado).
- Toda historia de usuario marcada como completada debe reflejar su estado real en el `.md` (ej. cambiar de "pendiente" a "implementado" o mover a un changelog de avances).
- Los cambios en el modelo de datos (nuevas tablas, columnas, migraciones) deben documentarse en un archivo de migraciones o en la sección de modelo de datos del plan de acción.

## 7. Arquitectura limpia: aliviar el router, aprovechar services

- El router (capa de rutas de Express) debe limitar su responsabilidad a: recibir el request, validar el formato básico de entrada (o delegar a un middleware de validación), llamar al service correspondiente, y devolver la respuesta.
- Toda la lógica de negocio (cálculos de saldo, generación de mensajes de WhatsApp, validación de reglas de dominio, queries a la base de datos) debe vivir en la capa de `services`.
- Estructura de carpetas sugerida:
  ```
  /src
    /routes      -> solo definición de endpoints y llamado a controllers
    /controllers -> maneja request/response, delega a services
    /services    -> lógica de negocio y acceso a datos (queries con pg)
    /middlewares -> auth, validación, manejo de errores
    /utils       -> helpers (generación de links wa.me, formateo de fechas, etc.)
  ```
- Ningún router debe contener queries SQL directas ni lógica condicional compleja de negocio.

## 8. Definition of Done (DoD) antes de commitear

Una tarea/endpoint se considera terminada solo si cumple:
- [ ] Funciona según lo especificado en la historia de usuario correspondiente.
- [ ] Usa queries parametrizadas y pasa por la capa de `services` (no lógica en el router).
- [ ] Maneja errores y casos borde (inputs inválidos, recursos no encontrados, no autorizado).
- [ ] Se probó manualmente (o con test si aplica) el flujo completo, incluyendo casos de error.
- [ ] No rompe funcionalidad existente.
- [ ] La documentación (`.md`, comentarios, changelog) está actualizada si el endpoint cambia el comportamiento planeado.
- [ ] El código no contiene credenciales, console.logs de depuración olvidados, ni código muerto.

Solo cuando el DoD se cumple en su totalidad se procede a hacer commit.

## 9. Convenciones de commits

- Se usan Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`).
- El commit se realiza únicamente al final, cuando la tarea está completa, confirmada y cumple el DoD (regla 8) — no se commitea código a medio terminar o sin probar.
- El mensaje de commit debe referenciar el módulo o historia de usuario relacionada, ej.: `feat(deudas): agregar endpoint para registrar abono parcial (HU-4.1)`.

---

## 10. Flujo de trabajo resumido para cada nueva tarea/ticket

1. Revisar el `.md` del plan de acción y este `rules.md` para entender contexto y convenciones.
2. Identificar a qué módulo/HU pertenece la tarea (o proponer si es nueva).
3. Evaluar y proponer el enfoque técnico (dónde va la lógica, qué librerías, impacto en código existente) antes de escribir código.
4. Preguntar cualquier duda de alcance o requerimiento antes de implementar.
5. Implementar respetando la separación router → controller → service, y las reglas de seguridad (sección 5).
6. Verificar cumplimiento del DoD (sección 8).
7. Actualizar documentación relevante (sección 6).
8. Hacer commit siguiendo convenciones (sección 9).
