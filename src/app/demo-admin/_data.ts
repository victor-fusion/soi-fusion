// ─────────────────────────────────────────────────────────────────────────────
// Datos ficticios del prototipo /demo-admin (vista del equipo de Fusión).
// Coherentes con /demo: Turnio, ciclo 6, semana 7, fase 2 · Solucionar.
// ─────────────────────────────────────────────────────────────────────────────

export const ADMIN_ME = { name: "Víctor Humanes", first: "Víctor", role: "PM · Fusión", initials: "VH" };

export type Health = "bien" | "atencion" | "riesgo";

export const HEALTH: Record<Health, { label: string; color: string; bg: string; order: number }> = {
  riesgo:   { label: "En riesgo", color: "#BE123C", bg: "#FFF1F2", order: 0 },
  atencion: { label: "Atención",  color: "#B45309", bg: "#FEF3C7", order: 1 },
  bien:     { label: "Bien",      color: "#15803D", bg: "#F0FDF4", order: 2 },
};

export interface PortfolioStartup {
  id: string; name: string; sector: string; type: "B2B SaaS" | "B2C App"; phase: number; owner: string;
  health: Health; signals: string[]; progress: number; mrr: number; mrrTrend: number[];
  pipeline: number; lastWeekly: number; lastLogin: number; pendingReview: number; overdue: number;
  daysInPhase: number; phaseMedian: number; color: string;
}

export const PORTFOLIO: PortfolioStartup[] = [
  { id: "turnio", name: "Turnio", sector: "Salud animal", type: "B2B SaaS", phase: 2, owner: "Víctor Humanes", health: "atencion",
    signals: ["Métricas de octubre sin registrar"], progress: 58, mrr: 178, mrrTrend: [0, 0, 0, 0, 89, 178], pipeline: 4,
    lastWeekly: 7, lastLogin: 0, pendingReview: 2, overdue: 0, daysInPhase: 16, phaseMedian: 28, color: "#16A34A" },
  { id: "kidoo", name: "Kidoo", sector: "EdTech", type: "B2B SaaS", phase: 2, owner: "Paula Méndez", health: "riesgo",
    signals: ["Nadie ha entrado en 9 días", "12 días sin weekly", "2 entregables vencidos"], progress: 31, mrr: 0, mrrTrend: [0, 0, 0, 0, 0, 0], pipeline: 1,
    lastWeekly: 12, lastLogin: 9, pendingReview: 0, overdue: 2, daysInPhase: 18, phaseMedian: 28, color: "#EA580C" },
  { id: "kuvo", name: "Kuvo", sector: "Deporte", type: "B2C App", phase: 2, owner: "Sergio Vidal", health: "riesgo",
    signals: ["MRR cae 2 meses seguidos", "Pipeline sin movimiento 3 semanas"], progress: 44, mrr: 140, mrrTrend: [60, 150, 210, 240, 190, 140], pipeline: 0,
    lastWeekly: 6, lastLogin: 1, pendingReview: 1, overdue: 1, daysInPhase: 20, phaseMedian: 28, color: "#0891B2" },
  { id: "flamma", name: "Flamma", sector: "Energía", type: "B2B SaaS", phase: 1, owner: "Víctor Humanes", health: "atencion",
    signals: ["Lleva 31 días en Descubrir (mediana 24)"], progress: 39, mrr: 0, mrrTrend: [0, 0, 0, 0, 0, 0], pipeline: 2,
    lastWeekly: 5, lastLogin: 0, pendingReview: 1, overdue: 1, daysInPhase: 31, phaseMedian: 24, color: "#DC2626" },
  { id: "cuida", name: "Cuida+", sector: "Salud", type: "B2C App", phase: 2, owner: "Paula Méndez", health: "atencion",
    signals: ["Pipeline sin movimiento 3 semanas"], progress: 52, mrr: 45, mrrTrend: [0, 0, 0, 15, 30, 45], pipeline: 3,
    lastWeekly: 4, lastLogin: 2, pendingReview: 0, overdue: 0, daysInPhase: 15, phaseMedian: 28, color: "#7C3AED" },
  { id: "olivo", name: "Olivo Data", sector: "AgriTech", type: "B2B SaaS", phase: 3, owner: "Sergio Vidal", health: "bien",
    signals: [], progress: 74, mrr: 420, mrrTrend: [0, 0, 120, 240, 300, 420], pipeline: 7,
    lastWeekly: 3, lastLogin: 0, pendingReview: 1, overdue: 0, daysInPhase: 6, phaseMedian: 22, color: "#65A30D" },
  { id: "lonja", name: "Lonja", sector: "FoodTech", type: "B2B SaaS", phase: 3, owner: "Alba Torres", health: "bien",
    signals: [], progress: 70, mrr: 610, mrrTrend: [0, 90, 210, 380, 490, 610], pipeline: 9,
    lastWeekly: 2, lastLogin: 0, pendingReview: 1, overdue: 0, daysInPhase: 9, phaseMedian: 22, color: "#2563EB" },
  { id: "ruta-verde", name: "Ruta Verde", sector: "Movilidad", type: "B2B SaaS", phase: 2, owner: "Alba Torres", health: "bien",
    signals: [], progress: 63, mrr: 260, mrrTrend: [0, 0, 60, 120, 200, 260], pipeline: 5,
    lastWeekly: 1, lastLogin: 0, pendingReview: 1, overdue: 0, daysInPhase: 14, phaseMedian: 28, color: "#0D9488" },
  { id: "sana", name: "Sana Hogar", sector: "Salud", type: "B2C App", phase: 2, owner: "Jorge Lara", health: "bien",
    signals: [], progress: 60, mrr: 95, mrrTrend: [0, 0, 20, 45, 70, 95], pipeline: 4,
    lastWeekly: 3, lastLogin: 1, pendingReview: 0, overdue: 0, daysInPhase: 12, phaseMedian: 28, color: "#DB2777" },
  { id: "brisa", name: "Brisa", sector: "Turismo", type: "B2C App", phase: 2, owner: "", health: "bien",
    signals: [], progress: 55, mrr: 120, mrrTrend: [0, 10, 30, 60, 90, 120], pipeline: 3,
    lastWeekly: 6, lastLogin: 0, pendingReview: 0, overdue: 0, daysInPhase: 13, phaseMedian: 28, color: "#CA8A04" },
];

/** Reglas que generan las señales. Son reglas simples, no IA. */
export const SIGNAL_RULES = [
  { signal: "Sin weekly", rule: "Más de 10 días desde la última weekly registrada." },
  { signal: "Sin accesos", rule: "Ningún miembro del equipo ha entrado en SOI en 7 días." },
  { signal: "Entregables vencidos", rule: "Uno o más entregables pasados de fecha sin enviar a revisión." },
  { signal: "Métricas sin registrar", rule: "El día 5 del mes no están las métricas del mes anterior." },
  { signal: "Fase larga", rule: "Días en la fase actual por encima de la mediana de ciclos anteriores." },
  { signal: "MRR cae", rule: "El MRR baja dos meses seguidos." },
  { signal: "Pipeline parado", rule: "Ningún contacto del CRM ha cambiado de etapa en 3 semanas." },
];

export type ReviewType = "entregable" | "plantilla" | "weekly" | "sdr" | "fase";

export const REVIEW_TYPES: Record<ReviewType, { label: string; plural: string }> = {
  entregable: { label: "Entregable", plural: "Entregables" },
  plantilla:  { label: "Plantilla",  plural: "Plantillas" },
  weekly:     { label: "Weekly",     plural: "Weeklies" },
  sdr:        { label: "Agente SDR", plural: "Agente SDR" },
  fase:       { label: "Cambio de fase", plural: "Cambios de fase" },
};

export interface ReviewItem {
  id: string; type: ReviewType; startupId: string; startup: string; title: string;
  by: string; when: string; days: number; high: boolean; detail: string;
}

export const REVIEW_QUEUE: ReviewItem[] = [
  { id: "q1", type: "entregable", startupId: "turnio", startup: "Turnio", title: "Pricing v1", by: "Marta Romero", when: "hace 2 días", days: 2, high: true,
    detail: "Tres planes (Básico 49 €, Clínica 89 €, Hospital 249 €) con precio por centro. Justificación basada en las horas de recepción ahorradas y en la tasa de ausencias medida en los pilotos." },
  { id: "q2", type: "entregable", startupId: "turnio", startup: "Turnio", title: "Scripts de prospección enviados", by: "Irene Gil", when: "hoy", days: 0, high: false,
    detail: "46 mensajes enviados en 3 variantes. Tasa de respuesta 19,6 %. La variante con dato de ausencias responde el doble que la genérica." },
  { id: "q3", type: "entregable", startupId: "olivo", startup: "Olivo Data", title: "Primeros 10 usuarios activos", by: "Rafael Ortiz", when: "hace 4 días", days: 4, high: true,
    detail: "12 técnicos de 3 cooperativas usando el panel semanalmente. Retención a 4 semanas: 9 de 12." },
  { id: "q4", type: "fase", startupId: "lonja", startup: "Lonja", title: "Pasar de Activar a Vender", by: "Alba Torres", when: "ayer", days: 1, high: true,
    detail: "Lonja cumple 4 de 4 criterios de salida de Activar. Alba propone el cambio de fase." },
  { id: "q5", type: "plantilla", startupId: "ruta-verde", startup: "Ruta Verde", title: "Canvas de diferenciación competitiva", by: "Daniel Soto", when: "hace 1 día", days: 1, high: false,
    detail: "Compara con Glovo, mensajeros en furgoneta y reparto propio. Diferencial: entrega en zonas de bajas emisiones sin restricción horaria." },
  { id: "q6", type: "weekly", startupId: "turnio", startup: "Turnio", title: "Borrador de la weekly · semana 7", by: "Marta Romero", when: "hace 1 h", days: 0, high: false,
    detail: "2 entregables completados, 1 en revisión. 3 contactos nuevos en el CRM; Vet Aljarafe pasa a propuesta. MRR 178 € sin cambios. Arrastra: enseñar el mockup a 5 clínicas (3/5)." },
  { id: "q7", type: "sdr", startupId: "turnio", startup: "Turnio", title: "Mensaje a Clínica Veterinaria San Bernardo", by: "Marta Romero (aprobado)", when: "hace 3 h", days: 0, high: false,
    detail: "Hola Inés, he visto que habéis abierto la nueva sede de Nervión, ¡enhorabuena! Con dos agendas suele pasar que los huecos y las ausencias se disparan. En Turnio ayudamos a clínicas como Los Remedios a reducir un 30 % las citas perdidas con recordatorios por WhatsApp. ¿Te enseño en 15 minutos cómo lo hacen?" },
];

/** Criterios de salida de la fase 2 (Solucionar → Activar) para Turnio. Los mismos que ve la founder en /demo/mi-ciclo. */
export const PHASE_GATE = {
  from: "Solucionar", to: "Activar",
  criteria: [
    { text: "Mockup validado por 5 clínicas", evidence: "3 de 5", state: "parcial" as const },
    { text: "Pricing v1 aprobado", evidence: "En revisión", state: "pendiente" as const },
    { text: "15 entrevistas registradas", evidence: "34", state: "ok" as const },
    { text: "Métrica norte definida", evidence: "Clínicas en piloto", state: "ok" as const },
  ],
};

export const LONJA_GATE = [
  { text: "10 usuarios activos semanales", evidence: "23", state: "ok" as const },
  { text: "Retención a 4 semanas > 40 %", evidence: "61 %", state: "ok" as const },
  { text: "Primer cliente de pago", evidence: "5 restaurantes", state: "ok" as const },
  { text: "Canal de adquisición identificado", evidence: "Lonjas de Huelva y Cádiz", state: "ok" as const },
];

export type EventKind = "fase" | "entregable" | "weekly" | "metricas" | "crm";

export const TIMELINE: { when: string; kind: EventKind; text: string; who: string }[] = [
  { when: "hoy, 09:12", kind: "entregable", text: "Envió «Scripts de prospección enviados» a revisión", who: "Irene Gil" },
  { when: "ayer", kind: "crm", text: "Vet Aljarafe pasa a Propuesta", who: "Marta Romero" },
  { when: "hace 2 días", kind: "entregable", text: "Envió «Pricing v1» a revisión", who: "Marta Romero" },
  { when: "hace 2 días", kind: "entregable", text: "Pidió cambios en «Propuesta diferenciada»", who: "Víctor Humanes" },
  { when: "hace 4 días", kind: "crm", text: "AniCura Bormujos empieza piloto", who: "Irene Gil" },
  { when: "hace 5 días", kind: "entregable", text: "Aprobó «Lista de 100 ICPs»", who: "Víctor Humanes" },
  { when: "10 nov", kind: "weekly", text: "Weekly semana 6 · 4 tareas acordadas", who: "Víctor Humanes" },
  { when: "10 nov", kind: "entregable", text: "Aprobó «Identidad de marca inicial»", who: "Víctor Humanes" },
  { when: "3 nov", kind: "weekly", text: "Weekly semana 5 · cierre de Descubrir", who: "Víctor Humanes" },
  { when: "1 nov", kind: "fase", text: "Cambio de fase: Descubrir → Solucionar", who: "Víctor Humanes" },
  { when: "1 nov", kind: "metricas", text: "Métricas de septiembre registradas · MRR 0 €", who: "Marta Romero" },
  { when: "29 oct", kind: "entregable", text: "Aprobó «Bitácora de entrevistas» (devuelto 1 vez)", who: "Víctor Humanes" },
  { when: "24 oct", kind: "entregable", text: "Pidió cambios en «Bitácora de entrevistas»", who: "Víctor Humanes" },
  { when: "1 oct", kind: "fase", text: "Inicio del ciclo 6 · fase Descubrir", who: "SOI" },
];

export const EVENT_KINDS: Record<EventKind, { label: string; color: string }> = {
  fase:       { label: "Fase",        color: "#7C3AED" },
  entregable: { label: "Entregables", color: "#2563EB" },
  weekly:     { label: "Weeklies",    color: "#374151" },
  metricas:   { label: "Métricas",    color: "#0D9488" },
  crm:        { label: "CRM",         color: "#EA580C" },
};

/** Mediana de días en cada fase (1–6) por ciclo. null = fase aún no completada por el ciclo. */
export const CYCLE_MEDIANS: { cycle: number; days: (number | null)[]; completed: (number | null)[]; mrrOut: (number | null)[] }[] = [
  { cycle: 3, days: [33, 38, 30, 34, 31, 29], completed: [100, 86, 71, 57, 57, 57], mrrOut: [0, 0, 60, 310, 720, 1100] },
  { cycle: 4, days: [28, 31, 26, 30, 28, 27], completed: [100, 100, 83, 67, 67, 67], mrrOut: [0, 20, 110, 380, 840, 1350] },
  { cycle: 5, days: [24, 28, 22, 27, 25, 26], completed: [100, 100, 86, 71, 71, 71], mrrOut: [0, 40, 150, 450, 980, 1600] },
  { cycle: 6, days: [23, null, null, null, null, null], completed: [90, null, null, null, null, null], mrrOut: [0, null, null, null, null, null] },
];

export const LEARNINGS = [
  { text: "8 de cada 10 startups que pasaron Descubrir en menos de 25 días rellenaron la plantilla ICP antes de la semana 3.", base: "ciclos 3–5 · 20 startups" },
  { text: "Las que tuvieron office hours de pricing con Ana Prieto en Solucionar llegaron a Vender 9 días antes que la mediana.", base: "ciclos 4–5 · 11 startups" },
  { text: "Ninguna startup con más de 2 semanas sin weekly en Solucionar llegó a la fase Vender dentro del ciclo.", base: "ciclos 3–5 · 6 casos" },
  { text: "Las que registraron más de 20 entrevistas en Descubrir tienen el doble de MRR al salir de Activar.", base: "ciclos 3–5 · 20 startups" },
  { text: "El playbook «Secuencias de outbound para B2B local» es el recurso más usado por las que superan 3 clientes en Vender.", base: "ciclos 4–5 · 9 startups" },
];

export const FUSION_TEAM_LOAD = [
  { name: "Víctor Humanes", role: "PM · Ventas y comunicación", initials: "VH", color: "#374151", startups: ["Turnio", "Flamma"], reviews: 3, weeklies: 3 },
  { name: "Paula Méndez", role: "Programa", initials: "PM", color: "#7C3AED", startups: ["Kidoo", "Cuida+"], reviews: 0, weeklies: 1 },
  { name: "Sergio Vidal", role: "Producto y tecnología", initials: "SV", color: "#2563EB", startups: ["Kuvo", "Olivo Data"], reviews: 2, weeklies: 2 },
  { name: "Alba Torres", role: "Growth", initials: "AT", color: "#EA580C", startups: ["Lonja", "Ruta Verde"], reviews: 3, weeklies: 2 },
  { name: "Jorge Lara", role: "Dirección", initials: "JL", color: "#0D9488", startups: ["Sana Hogar"], reviews: 0, weeklies: 1 },
];

export const MEETINGS_TODAY = [
  { time: "10:00", startupId: "turnio", startup: "Turnio", with: "Marta Romero, Pablo Ortega" },
  { time: "12:30", startupId: "flamma", startup: "Flamma", with: "Lucas Prado" },
  { time: "16:00", startupId: "kidoo", startup: "Kidoo", with: "Clara Núñez (por confirmar)" },
];

/** Preparación de weekly que SOI redacta a partir de los datos. Turnio completo; resto genérico. */
export const WEEKLY_PREP: Record<string, { changed: string[]; worries: string[]; carried: string[]; questions: string[] }> = {
  turnio: {
    changed: ["«Lista de 100 ICPs» aprobada", "«Pricing v1» y «Scripts de prospección» enviados a revisión", "Vet Aljarafe pasa a Propuesta; AniCura Bormujos empieza piloto", "4 clínicas en piloto (objetivo de la fase: 5 validaciones)"],
    worries: ["Métricas de octubre sin registrar", "«Propuesta diferenciada» devuelta: falta cuantificar el ahorro"],
    carried: ["Enseñar el mockup a 5 clínicas (3/5) · Marta · 21 nov"],
    questions: ["¿Qué falta para las 2 validaciones de mockup que quedan y cuándo las tenéis?", "¿El pricing aguanta la objeción de Vet Aljarafe sobre integración con facturación?", "¿Quién registra las métricas y cuándo? ¿Qué os lo impide?"],
  },
  flamma: {
    changed: ["2 entrevistas nuevas registradas (total 11)", "Envió «ICP v1» a revisión"],
    worries: ["Lleva 31 días en Descubrir; la mediana es 24", "1 entregable vencido: «Bitácora de entrevistas»"],
    carried: ["Cerrar 5 entrevistas con hoteles · Lucas · 14 nov"],
    questions: ["¿Qué os impide cerrar las entrevistas que faltan?", "¿El ICP sigue siendo hostelería o estáis viendo otro segmento?", "¿Qué necesitáis de Fusión para salir de Descubrir esta semana?"],
  },
  kidoo: {
    changed: ["Sin actividad en SOI en los últimos 9 días"],
    worries: ["12 días sin weekly", "2 entregables vencidos", "Nadie del equipo ha entrado en 9 días"],
    carried: ["Validar mockup con 3 colegios · Clara · 10 nov", "Lista de 50 colegios · Iván · 12 nov"],
    questions: ["¿Qué ha pasado estas dos semanas?", "¿Sigue el equipo dedicando el tiempo acordado?", "¿Hay que replantear objetivos de la fase?"],
  },
};

export const ADMIN_NOTIFICATIONS = [
  { id: "a1", who: "Turnio", text: "ha enviado «Pricing v1» a revisión", when: "hace 2 días", href: "/demo-admin/revision", unread: true },
  { id: "a2", who: "Kidoo", text: "lleva 12 días sin weekly", when: "hoy", href: "/demo-admin/startups/kidoo", unread: true },
  { id: "a3", who: "Lonja", text: "cumple los criterios para pasar a Vender", when: "ayer", href: "/demo-admin/revision", unread: true },
  { id: "a4", who: "Kuvo", text: "registra caída de MRR por segundo mes", when: "hace 3 días", href: "/demo-admin/startups/kuvo", unread: false },
  { id: "a5", who: "Brisa", text: "no tiene responsable de Fusión asignado", when: "hace 1 semana", href: "/demo-admin/equipo", unread: false },
];

export const RECENT_ACTIVITY = [
  { who: "Turnio", text: "envió «Scripts de prospección enviados» a revisión", when: "hoy 09:12" },
  { who: "Lonja", text: "registró las métricas de octubre · MRR 610 €", when: "ayer" },
  { who: "Olivo Data", text: "ganó un cliente: Cooperativa San Isidro", when: "ayer" },
  { who: "Ruta Verde", text: "rellenó «Canvas de diferenciación competitiva»", when: "ayer" },
  { who: "Kuvo", text: "registró las métricas de octubre · MRR 140 € (−26 %)", when: "hace 2 días" },
];
