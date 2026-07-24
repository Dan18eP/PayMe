# PayMe! — Sistema de Registro de Deudas y Recordatorios por WhatsApp

Aplicación web para registrar personas que te deben dinero, definir esquemas de pago personalizables, dar seguimiento a abonos parciales y generar recordatorios vía WhatsApp.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Tailwind CSS + TypeScript (Vite) |
| Backend | Express + TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Autenticación | Supabase Auth |
| Validación | Zod |

## Estructura del proyecto

```
├── backend/          # API REST con Express + Drizzle ORM
│   └── src/
│       ├── db/          # Esquema, cliente y migraciones Drizzle
│       ├── routes/      # Definición de endpoints
│       ├── controllers/ # Manejo de request/response
│       ├── services/    # Lógica de negocio
│       ├── repositories/# Acceso a datos con Drizzle
│       ├── middlewares/  # Auth, validación, manejo de errores
│       ├── validators/  # Schemas Zod
│       ├── utils/       # Helpers (WhatsApp, fechas, tokens)
│       └── config/      # Variables de entorno, cliente Supabase Admin
├── frontend/         # Cliente React + Tailwind
│   └── src/
│       ├── features/   # Módulos (auth, debtors, debts, reminders, dashboard)
│       ├── components/ # Componentes compartidos
│       ├── layouts/    # Layouts (MainLayout, AuthLayout)
│       ├── hooks/      # Custom hooks
│       ├── pages/      # Páginas
│       ├── services/   # httpClient (fetch nativo)
│       ├── store/      # Zustand (authStore)
│       ├── types/      # Tipos TypeScript
│       └── utils/      # Helpers
├── docs/             # Documentación técnica
└── plan_accion_deudas_v2.md
```

## Requisitos

- Node.js >= 18
- Supabase project (base de datos + auth)

## Configuración inicial

1. Clonar el repositorio e instalar dependencias:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

2. Copiar variables de entorno:

```bash
cp backend/.env.example backend/.env
```

3. Configurar las variables en `backend/.env` con los datos de tu proyecto Supabase.

4. Generar y aplicar migraciones:

```bash
npm run db:generate
npm run db:migrate
```

5. Iniciar en desarrollo:

```bash
npm run dev
```

Esto levanta el backend en `http://localhost:3000` y el frontend en `http://localhost:5173` simultáneamente.

## Scripts disponibles

| Script | Descripción |
|--------|------------|
| `npm run dev` | Inicia backend y frontend concurrentemente |
| `npm run dev:backend` | Solo backend con hot-reload |
| `npm run dev:frontend` | Solo frontend con Vite |
| `npm run build` | Compila backend y frontend |
| `npm run db:generate` | Genera migraciones Drizzle |
| `npm run db:migrate` | Aplica migraciones a Supabase |

## Módulos (MVP)

1. **Autenticación** — registro, inicio/cierre de sesión con Supabase Auth
2. **Gestión de Deudores** — CRUD de contactos
3. **Gestión de Deudas** — creación con esquemas de pago personalizables
4. **Abonos y Pagos** — registro de abonos parciales y pagos totales
5. **Dashboard** — resumen general y deudas por antigüedad
6. **Recordatorios** — generación de links `wa.me` personalizados
7. **Historial** — cronología de eventos por deudor (Fase 2)
8. **Acuerdo de Compromiso** — documento firmable con token (Fase 2)
