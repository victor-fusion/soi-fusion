# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# SOI Fusión — Contexto para Claude Code

## Qué es este proyecto
SOI (Sistema Operativo Inteligente) de Fusión Startups — plataforma web que centraliza el seguimiento, formación y herramientas IA para los emprendedores del venture builder Fusión Startups (Sevilla, Andalucía).

El objetivo es que sea la herramienta diaria de cada startup durante su ciclo de 6 meses en Fusión, y que el equipo de Fusión tenga visibilidad y control total desde una vista admin.

## Quién lo construye
- **Víctor Humanes** — Project Manager de Fusión Startups (área ventas/comunicación). No es programador. Es quien dirige el producto.
- **2 ingenieros de software** del equipo de Fusión que implementan el código con ayuda de Claude.

## Commands
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint (no hay framework de tests configurado)

## Stack
- **Frontend/Backend**: Next.js 15 + TypeScript (App Router)
- **Base de datos + Auth**: Supabase (PostgreSQL, Row Level Security, SSR auth)
- **UI**: Mantine v8 (componente principal) + Tailwind CSS v4 + shadcn/ui (componentes secundarios: Popover, Select, Tabs)
- **Iconos**: Lucide React + Tabler Icons
- **IA**: Anthropic API (Claude) para el agente SDR y futuros agentes
- **Deploy**: Vercel Pro

El tema personalizado (color primario verde #16A34A) está en `src/components/providers.tsx`.

## Arquitectura hub + satélite
- `soi.fusionstartups.com` — hub central (auth SSO, panel, roadmap, recursos, agentes)
- `crm.fusionstartups.com` — satélite CRM (incluido como módulo en este repo)
- `academia.fusionstartups.com` — futuro

## Roles de usuario
- `founder` — emprendedor de una startup del ecosistema Fusión Startups. Ve solo su startup.
- `admin` — equipo Fusión (Víctor y compañeros). Ve todas las startups.

## Estructura del SOI (4 capas)
1. **El Camino** — Roadmap 2.0: 6 meses con objetivos, entregables, KPIs por mes y tipo de startup (B2B SaaS / B2C App)
2. **El Arsenal** — Biblioteca de contenido: Área > Sección > Tarjeta (playbook, template, herramienta, herramienta IA, checklist, recurso)
3. **Los Agentes IA** — SDR agent es prioridad #1: ICP → prospecta → genera mensajes → Víctor aprueba → ejecuta outreach
4. **Centro de Control** — Vista admin: todas las startups, CRMs, alertas de progreso

## Las 7 áreas permanentes
Estrategia (#16A34A), Producto (#2563EB), Growth (#EA580C), Finanzas (#7C3AED), Legal (#DB2777), Operaciones (#D97706), Equipo (#0D9488)

## Estado actual del proyecto
- [x] Paso 1 completado: Next.js + Supabase configurado, tipos, constantes, middleware auth, esquema SQL
- [ ] Paso 2: Login + Dashboard (Panel del Ciclo)
- [ ] Paso 3: Vista admin (Centro de Control de Víctor)
- [ ] Paso 4: Agente SDR

## Contenido existente en Notion
Roadmap 2.0 y FOS (ventas outbound) documentados en Notion de Fusión. Acceso vía MCP de Notion.
- Roadmap 2.0: `188d19acd46280328f78f7d97d3f4fd3`
- FOS (ventas): `306d19acd46281159938c36dc432acff`
- Fusión Startups OS (raíz): `37b8ab77eddb4e4ea36613a46b9b6b18`

## Agente SDR — decisiones tomadas
- Modo **supervisado**: agente propone prospectos + mensajes → Víctor aprueba → agente ejecuta
- Tabla `agent_tasks` en Supabase: pending_approval → approved → running → completed

## Convenciones de código
- Componentes en `src/components/` por dominio: `layout/`, `startup/`, `admin/`, `ui/`
- Rutas: `src/app/login/`, `src/app/dashboard/`, `src/app/admin/`
- Tipos en `src/types/index.ts`, constantes en `src/constants/areas.ts`
- Mutaciones siempre vía Server Actions en `[ruta]/actions.ts` — no hay API routes. Los formularios usan el hook `useActionState()` de React 19 con `FormData`.

## Clientes Supabase
- `src/lib/supabase/client.ts` — browser (SSR)
- `src/lib/supabase/server.ts` — Server Components (usa cookies)
- `src/lib/supabase/admin.ts` — service role key, bypasa RLS (usar solo para operaciones de admin como invitar usuarios)
- `src/proxy.ts` — punto de entrada del middleware de Next.js (no `middleware.ts`)

## Control de acceso
- **RLS en la base de datos** es la única capa de seguridad — no hay comprobaciones de rol en los componentes.
- `profiles.role` determina el routing en `/` (founder → `/dashboard`, admin → `/admin`).
- Al crear una startup, el trigger `assign_entregables_to_startup()` crea automáticamente las instancias de entregables a partir de `entregable_templates`.

## Contexto Fusión Startups
- Venture builder privado, Sevilla. Fundado abril 2024.
- 2 ciclos/año (abril y octubre). Ciclo 5 arranca abril 2026.
- 6-7 startups por ciclo (objetivo: 10). Equipo: 9 personas.
- Herramientas actuales: Slack + Notion (uso parcial)
