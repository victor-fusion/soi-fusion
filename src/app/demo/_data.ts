// ─────────────────────────────────────────────────────────────────────────────
// Datos ficticios del prototipo /demo. Nada de esto viene de la base de datos.
// Startup de ejemplo: Turnio (ciclo 6), semana 7 de 26, fase 2 · Solucionar.
// ─────────────────────────────────────────────────────────────────────────────

export const TODAY_LABEL = "Martes, 17 de noviembre";
export const CYCLE = { number: 6, week: 7, totalWeeks: 26, start: "1 oct 2026", end: "31 mar 2027" };

export const STARTUP = {
  name: "Turnio",
  tagline: "Agenda y recordatorios inteligentes para clínicas veterinarias",
  sector: "Salud animal · B2B SaaS",
  phase: 2,
  northStar: { metric: "Clínicas en piloto", value: 4, target: 10 },
  owner: "Víctor Humanes",
};

export const ME = { name: "Lucía Romero", first: "Lucía", role: "CEO · Cofundadora", initials: "LR" };

export const PHASES = [
  { n: 1, name: "Descubrir",  color: "#2563EB", weeks: "1–4",   status: "done" as const },
  { n: 2, name: "Solucionar", color: "#D97706", weeks: "5–9",   status: "current" as const },
  { n: 3, name: "Activar",    color: "#EA580C", weeks: "10–13", status: "next" as const },
  { n: 4, name: "Vender",     color: "#16A34A", weeks: "14–18", status: "next" as const },
  { n: 5, name: "Escalar",    color: "#7C3AED", weeks: "19–22", status: "next" as const },
  { n: 6, name: "Consolidar", color: "#DB2777", weeks: "23–26", status: "next" as const },
];

export const AREAS: Record<string, { name: string; color: string }> = {
  estrategia:  { name: "Estrategia",  color: "#16A34A" },
  producto:    { name: "Producto",    color: "#2563EB" },
  growth:      { name: "Growth",      color: "#EA580C" },
  finanzas:    { name: "Finanzas",    color: "#7C3AED" },
  legal:       { name: "Legal",       color: "#DB2777" },
  operaciones: { name: "Operaciones", color: "#D97706" },
  equipo:      { name: "Equipo",      color: "#0D9488" },
};

export type DelivStatus = "pendiente" | "en_progreso" | "en_revision" | "cambios_solicitados" | "completado";

export const STATUS: Record<DelivStatus, { label: string; color: string; bg: string }> = {
  pendiente:           { label: "Pendiente",          color: "#78716C", bg: "#F5F5F4" },
  en_progreso:         { label: "En progreso",        color: "#2563EB", bg: "#EFF6FF" },
  en_revision:         { label: "En revisión",        color: "#B45309", bg: "#FEF3C7" },
  cambios_solicitados: { label: "Cambios pedidos",    color: "#BE123C", bg: "#FFF1F2" },
  completado:          { label: "Completado",         color: "#15803D", bg: "#F0FDF4" },
};

export interface Deliverable {
  id: string; title: string; area: string; phase: number; status: DelivStatus;
  due: string; dueDays: number; brief: string; feedback?: string;
}

export const DELIVERABLES: Deliverable[] = [
  // Fase 1 (completada)
  { id: "tabla-valor", title: "Tabla de valor", area: "estrategia", phase: 1, status: "completado", due: "29 oct", dueDays: -19, brief: "" },
  { id: "icp-v1", title: "ICP v1 definido", area: "growth", phase: 1, status: "completado", due: "29 oct", dueDays: -19, brief: "" },
  { id: "bitacora", title: "Bitácora de entrevistas", area: "growth", phase: 1, status: "completado", due: "29 oct", dueDays: -19, brief: "" },
  { id: "journey", title: "User Journey mapeado", area: "producto", phase: 1, status: "completado", due: "29 oct", dueDays: -19, brief: "" },
  // Fase 2 (actual)
  { id: "propuesta", title: "Propuesta diferenciada", area: "estrategia", phase: 2, status: "cambios_solicitados", due: "19 nov", dueDays: 2,
    brief: "Versión refinada de la propuesta de valor que destaca el diferencial frente a alternativas. Debe superar la objeción «¿por qué tú y no X?».",
    feedback: "Buen avance. Falta comparar con Qvet y con la agenda en papel: ¿qué gana la clínica en minutos/semana? Cuantifícalo." },
  { id: "mockup", title: "Mockup navegable validado", area: "producto", phase: 2, status: "en_progreso", due: "21 nov", dueDays: 4,
    brief: "Prototipo en Figma que simula la experiencia y ha sido mostrado y comentado por al menos 5 clínicas (ICP)." },
  { id: "pricing", title: "Pricing v1", area: "finanzas", phase: 2, status: "en_progreso", due: "24 nov", dueDays: 7,
    brief: "Primera versión del modelo de precios: estructura, rango y justificación basada en valor percibido." },
  { id: "lista-icp", title: "Lista de 100 ICPs", area: "growth", phase: 2, status: "completado", due: "12 nov", dueDays: -5,
    brief: "Base de datos de 100 clínicas que encajan con el perfil: nombre, decisor, cargo y canal de contacto." },
  { id: "scripts", title: "Scripts de prospección enviados", area: "growth", phase: 2, status: "en_revision", due: "17 nov", dueDays: 0,
    brief: "Mensajes de primer contacto enviados a los ICPs de la lista, con variantes y métricas de respuesta." },
  { id: "waitlist", title: "Waitlist activa", area: "growth", phase: 2, status: "pendiente", due: "28 nov", dueDays: 11,
    brief: "Lista de clínicas interesadas captadas por la landing u outreach. Objetivo: mínimo 20 registros." },
  { id: "nda", title: "NDA y condiciones de uso", area: "legal", phase: 2, status: "pendiente", due: "28 nov", dueDays: 11,
    brief: "Documentos legales básicos para proteger la información compartida con clínicas piloto." },
  { id: "marca", title: "Identidad de marca inicial", area: "equipo", phase: 2, status: "completado", due: "10 nov", dueDays: -7,
    brief: "Logo, paleta, tono de comunicación y bio del proyecto." },
  { id: "landing", title: "Landing page activa", area: "growth", phase: 2, status: "pendiente", due: "28 nov", dueDays: 11,
    brief: "Web publicada con propuesta de valor, CTA claro y analítica instalada." },
];

export const TODAY_TASKS = [
  { id: "t1", title: "Responder a los cambios en «Propuesta diferenciada»", tag: "Entregable", href: "/demo/entregables/propuesta", urgent: true },
  { id: "t2", title: "Enseñar el mockup a Clínica Triana (3/5 validaciones)", tag: "Weekly", href: "/demo/weeklies", urgent: false },
  { id: "t3", title: "Aprobar 3 mensajes propuestos por el agente SDR", tag: "Agente", href: "/demo/agente", urgent: false },
  { id: "t4", title: "Registrar las métricas de octubre", tag: "Métricas", href: "/demo/metricas", urgent: false },
  { id: "t5", title: "Llamar a Vet Aljarafe: enviar propuesta de piloto", tag: "CRM", href: "/demo/crm", urgent: false },
];

export const AGENDA_TODAY = [
  { time: "10:00", end: "10:30", title: "Weekly con Víctor", who: "Víctor Humanes · Fusión", kind: "weekly" },
  { time: "12:00", end: "12:45", title: "Office hours: pricing SaaS", who: "Ana Prieto · Mentora Finanzas", kind: "mentor" },
  { time: "17:30", end: "18:00", title: "Demo mockup · Clínica Triana", who: "Cliente potencial", kind: "cliente" },
];

export const NOTIFICATIONS = [
  { id: "n1", who: "Víctor Humanes", text: "ha pedido cambios en «Propuesta diferenciada»", when: "hace 2 h", href: "/demo/entregables/propuesta", unread: true },
  { id: "n2", who: "Agente SDR", text: "ha preparado 3 mensajes nuevos para revisar", when: "hace 3 h", href: "/demo/agente", unread: true },
  { id: "n3", who: "Fusión", text: "Nuevo recurso en el Arsenal: «Pricing para SaaS verticales»", when: "ayer", href: "/demo/arsenal", unread: true },
  { id: "n4", who: "Víctor Humanes", text: "ha aprobado «Lista de 100 ICPs»", when: "ayer", href: "/demo/camino", unread: false },
  { id: "n5", who: "Comunidad", text: "Jueves 19: Demo Day interno del ciclo 6", when: "hace 2 días", href: "/demo/comunidad", unread: false },
];

export const TEAM = [
  { name: "Lucía Romero", role: "CEO · Cofundadora", type: "Cofundadora", dedication: "Full-time", initials: "LR", color: "#16A34A", office: ["L", "M", "X", "J"] },
  { name: "Pablo Ortega", role: "CTO · Cofundador", type: "Cofundador", dedication: "Full-time", initials: "PO", color: "#2563EB", office: ["L", "M", "J", "V"] },
  { name: "Marta Gil", role: "Growth", type: "Empleada", dedication: "Part-time", initials: "MG", color: "#EA580C", office: ["M", "J"] },
];

export const FUSION_TEAM = [
  { name: "Víctor Humanes", role: "Responsable de Turnio · PM", initials: "VH", color: "#14532D" },
];

export const MENTORS = [
  { name: "Ana Prieto", area: "finanzas", topic: "Pricing, unit economics, rondas", initials: "AP", slots: ["Mar 12:00", "Jue 10:00", "Jue 16:30"] },
  { name: "Javier Molina", area: "producto", topic: "Discovery, MVP, UX B2B", initials: "JM", slots: ["Mié 11:00", "Vie 09:30"] },
  { name: "Carmen Ruiz", area: "growth", topic: "Outbound, LinkedIn, ventas consultivas", initials: "CR", slots: ["Mar 16:00", "Mié 17:00", "Vie 12:00"] },
  { name: "Diego Navarro", area: "legal", topic: "Pactos de socios, RGPD, contratos", initials: "DN", slots: ["Jue 13:00"] },
];

export type Stage = "contacto_inicial" | "demo" | "propuesta" | "negociacion" | "cerrado_ganado";
export const STAGES: { id: Stage; label: string; color: string }[] = [
  { id: "contacto_inicial", label: "Contacto inicial", color: "#78716C" },
  { id: "demo",             label: "Demo",             color: "#2563EB" },
  { id: "propuesta",        label: "Propuesta",        color: "#D97706" },
  { id: "negociacion",      label: "Negociación",      color: "#7C3AED" },
  { id: "cerrado_ganado",   label: "Piloto / Cliente", color: "#16A34A" },
];

export interface Lead {
  id: string; company: string; contact: string; role: string; city: string; stage: Stage;
  value: number; source: string; last: string; next?: string; notes: string;
}

export const LEADS: Lead[] = [
  { id: "l1", company: "Clínica Veterinaria Triana", contact: "Elena Vázquez", role: "Directora", city: "Sevilla", stage: "demo", value: 89, source: "Agente SDR", last: "hoy", next: "Demo mockup hoy 17:30", notes: "Muy interesada en recordatorios por WhatsApp. 3 veterinarios." },
  { id: "l2", company: "Vet Aljarafe", contact: "Ramón Pérez", role: "Socio", city: "Mairena", stage: "propuesta", value: 129, source: "Referido", last: "ayer", next: "Enviar propuesta de piloto", notes: "Pide integración con su software de facturación." },
  { id: "l3", company: "Hospital Veterinario Nervión", contact: "Sofía Martín", role: "Gerente", city: "Sevilla", stage: "negociacion", value: 249, source: "Evento", last: "hace 3 días", next: "Revisar condiciones del piloto", notes: "Hospital 24h, 12 veterinarios. Decisión en diciembre." },
  { id: "l4", company: "Clínica Los Remedios", contact: "Álvaro Díaz", role: "Veterinario", city: "Sevilla", stage: "cerrado_ganado", value: 89, source: "LinkedIn", last: "hace 1 semana", notes: "Piloto gratuito hasta enero." },
  { id: "l5", company: "AniCura Bormujos", contact: "Laura Sanz", role: "Coordinadora", city: "Bormujos", stage: "cerrado_ganado", value: 129, source: "Agente SDR", last: "hace 4 días", notes: "Piloto en marcha desde el 10 nov." },
  { id: "l6", company: "Veterinaria Dos Hermanas", contact: "Pedro Ríos", role: "Propietario", city: "Dos Hermanas", stage: "contacto_inicial", value: 89, source: "Agente SDR", last: "hace 2 días", next: "Seguimiento si no responde", notes: "" },
  { id: "l7", company: "Clínica Gato y Perro", contact: "Nuria León", role: "Directora", city: "Sevilla", stage: "contacto_inicial", value: 89, source: "Agente SDR", last: "ayer", notes: "" },
  { id: "l8", company: "VetCenter Utrera", contact: "Manuel Gil", role: "Socio", city: "Utrera", stage: "demo", value: 129, source: "Cold email", last: "hace 5 días", next: "Agendar demo", notes: "" },
  { id: "l9", company: "Clínica Macarena", contact: "Rocío Blanco", role: "Veterinaria", city: "Sevilla", stage: "cerrado_ganado", value: 89, source: "Referido", last: "hace 2 semanas", notes: "Primer piloto. Muy buena relación." },
  { id: "l10", company: "Centro Vet Écija", contact: "Andrés Moreno", role: "Director", city: "Écija", stage: "contacto_inicial", value: 89, source: "Agente SDR", last: "hoy", notes: "" },
];

export const SDR_PROPOSALS = [
  { id: "p1", company: "Clínica Veterinaria San Bernardo", contact: "Inés Castro", role: "Directora", reason: "Clínica de 4 veterinarios, abrió 2.ª sede en 2026 y publica ofertas de recepcionista.", channel: "LinkedIn",
    message: "Hola Inés, he visto que habéis abierto la nueva sede de Nervión, ¡enhorabuena! Con dos agendas suele pasar que los huecos y las ausencias se disparan. En Turnio ayudamos a clínicas como Los Remedios a reducir un 30 % las citas perdidas con recordatorios por WhatsApp. ¿Te enseño en 15 minutos cómo lo hacen?" },
  { id: "p2", company: "Hospital Veterinario Aljarafe", contact: "Tomás Reyes", role: "Gerente", reason: "Hospital 24h: alto volumen de citas y urgencias, perfil idéntico a Nervión (en negociación).", channel: "Email",
    message: "Hola Tomás, gestionar urgencias 24h y citas programadas en la misma agenda es un puzzle diario. Turnio prioriza huecos automáticamente y avisa al cliente por WhatsApp. Estamos haciendo pilotos gratuitos con hospitales de Sevilla este trimestre. ¿Te encaja una llamada el jueves?" },
  { id: "p3", company: "Clínica Mascotas Felices", contact: "Lorena Vega", role: "Veterinaria titular", reason: "Clínica pequeña con reseñas que mencionan «difícil conseguir cita».", channel: "Email",
    message: "Hola Lorena, he leído varias reseñas de clientes contentos con vuestro trato… y algunos comentando que cuesta conseguir cita por teléfono. Turnio permite a tus clientes reservar online 24/7 sin cambiar tu forma de trabajar. ¿Te cuento cómo en 10 minutos?" },
];

export const SDR_STATS = { sent: 46, replied: 9, meetings: 4, replyRate: 19.6 };

export const METRICS = [
  { month: "jun", mrr: 0,   pilots: 0, users: 0,  interviews: 6 },
  { month: "jul", mrr: 0,   pilots: 0, users: 0,  interviews: 14 },
  { month: "ago", mrr: 0,   pilots: 0, users: 0,  interviews: 21 },
  { month: "sep", mrr: 0,   pilots: 1, users: 3,  interviews: 26 },
  { month: "oct", mrr: 89,  pilots: 2, users: 9,  interviews: 31 },
  { month: "nov", mrr: 178, pilots: 4, users: 17, interviews: 34 },
];

export const WEEKLIES = [
  {
    id: "w7", date: "Martes 17 nov", week: 7, with: "Víctor Humanes", upcoming: true,
    agenda: ["Feedback de la propuesta diferenciada", "Estado validaciones del mockup (3/5)", "Primer borrador de pricing"],
    notes: "",
    tasks: [] as { text: string; owner: string; due: string; done: boolean }[],
  },
  {
    id: "w6", date: "Martes 10 nov", week: 6, with: "Víctor Humanes", upcoming: false,
    agenda: ["Cierre Lista de 100 ICPs", "Arranque del agente SDR", "Bloqueos del mockup"],
    notes: "La lista de ICPs queda aprobada. El agente SDR empieza con 20 clínicas de Sevilla capital. El mockup va con retraso por el flujo de recordatorios: priorizar la vista de agenda para las validaciones.",
    tasks: [
      { text: "Enseñar el mockup a 5 clínicas", owner: "Lucía", due: "21 nov", done: false },
      { text: "Configurar el ICP del agente SDR", owner: "Marta", due: "12 nov", done: true },
      { text: "Pedir a Ana Prieto una sesión de pricing", owner: "Lucía", due: "14 nov", done: true },
      { text: "Simplificar flujo de recordatorios en Figma", owner: "Pablo", due: "15 nov", done: true },
    ],
  },
  {
    id: "w5", date: "Martes 3 nov", week: 5, with: "Víctor Humanes", upcoming: false,
    agenda: ["Cierre de la fase Descubrir", "Plan de la fase Solucionar"],
    notes: "Fase 1 completada con 34 entrevistas. El dolor más repetido: ausencias sin avisar (≈15 % de las citas). Foco de la fase 2: recordatorios + agenda compartida.",
    tasks: [
      { text: "Completar la Lista de 100 ICPs", owner: "Marta", due: "12 nov", done: true },
      { text: "Primera versión de la identidad de marca", owner: "Pablo", due: "10 nov", done: true },
    ],
  },
];

export const RESOURCES = [
  { id: "r1", title: "Cómo escribir una propuesta de valor que se entienda en 10 segundos", type: "Playbook", area: "estrategia", minutes: 12, phase: 2, isNew: false, forDeliverable: "propuesta" },
  { id: "r2", title: "Plantilla: Canvas de diferenciación competitiva", type: "Plantilla", area: "estrategia", minutes: 20, phase: 2, isNew: false, forDeliverable: "propuesta" },
  { id: "r3", title: "Pricing para SaaS verticales", type: "Playbook", area: "finanzas", minutes: 15, phase: 2, isNew: true, forDeliverable: "pricing" },
  { id: "r4", title: "Calculadora de precio basada en valor", type: "Herramienta IA", area: "finanzas", minutes: 5, phase: 2, isNew: true, forDeliverable: "pricing" },
  { id: "r5", title: "Guía: validar un mockup con 5 clientes", type: "Playbook", area: "producto", minutes: 10, phase: 2, isNew: false, forDeliverable: "mockup" },
  { id: "r6", title: "Checklist de landing page que convierte", type: "Checklist", area: "growth", minutes: 8, phase: 2, isNew: false, forDeliverable: "landing" },
  { id: "r7", title: "Plantillas de NDA y condiciones de piloto", type: "Plantilla", area: "legal", minutes: 10, phase: 2, isNew: false, forDeliverable: "nda" },
  { id: "r8", title: "Secuencias de outbound para B2B local", type: "Playbook", area: "growth", minutes: 14, phase: 2, isNew: false, forDeliverable: "scripts" },
  { id: "r9", title: "Cómo hacer entrevistas Mom Test", type: "Playbook", area: "growth", minutes: 18, phase: 1, isNew: false, forDeliverable: "" },
  { id: "r10", title: "Generador de ICP con IA", type: "Herramienta IA", area: "growth", minutes: 5, phase: 1, isNew: false, forDeliverable: "" },
  { id: "r11", title: "Modelo financiero a 12 meses", type: "Plantilla", area: "finanzas", minutes: 30, phase: 5, isNew: false, forDeliverable: "" },
  { id: "r12", title: "Pacto de socios: lo que no puede faltar", type: "Recurso", area: "legal", minutes: 9, phase: 1, isNew: false, forDeliverable: "" },
];

export const COHORT = [
  { name: "Turnio", tagline: "Agenda para clínicas veterinarias", sector: "Salud animal", phase: 2, inOffice: 3, color: "#16A34A", isMe: true },
  { name: "Ruta Verde", tagline: "Logística de última milla con bici de carga", sector: "Movilidad", phase: 2, inOffice: 2, color: "#0D9488", isMe: false },
  { name: "Olivo Data", tagline: "Predicción de cosecha para cooperativas de aceite", sector: "AgriTech", phase: 3, inOffice: 1, color: "#65A30D", isMe: false },
  { name: "Kidoo", tagline: "Gestión de extraescolares para colegios", sector: "EdTech", phase: 2, inOffice: 0, color: "#EA580C", isMe: false },
  { name: "Flamma", tagline: "Monitorización energética para hostelería", sector: "Energía", phase: 1, inOffice: 2, color: "#DC2626", isMe: false },
  { name: "Lonja", tagline: "Marketplace de pescado fresco para restaurantes", sector: "FoodTech", phase: 3, inOffice: 2, color: "#2563EB", isMe: false },
  { name: "Cuida+", tagline: "Coordinación de cuidadores para mayores", sector: "Salud", phase: 2, inOffice: 1, color: "#7C3AED", isMe: false },
];

export const EVENTS = [
  { date: "19", month: "nov", title: "Demo Day interno · Ciclo 6", where: "Sala grande", time: "18:00" },
  { date: "24", month: "nov", title: "Taller: negociar un piloto B2B", where: "Online", time: "16:00" },
  { date: "01", month: "dic", title: "Desayuno con inversores ángel", where: "Fusión", time: "09:30" },
];

export const PERKS = [
  { title: "Créditos cloud", detail: "Hasta 5.000 € en AWS y Google Cloud" },
  { title: "Asesoría legal", detail: "2 h/mes con el despacho partner" },
  { title: "Notion y HubSpot", detail: "Planes Startup gratis 12 meses" },
  { title: "Gestoría", detail: "Constitución de la SL a precio Fusión" },
];

export const COPILOT_MESSAGES = [
  { from: "ai", text: "He revisado tu borrador y el comentario de Víctor. Te falta cuantificar el ahorro frente a Qvet y la agenda en papel. Con tus entrevistas tengo estos datos: las clínicas pierden ≈15 % de citas por ausencias y dedican ~6 h/semana a llamar para confirmar." },
  { from: "me", text: "¿Me propones una frase de diferenciación con esos números?" },
  { from: "ai", text: "Propuesta: «Turnio llena los huecos de tu agenda: recordatorios automáticos por WhatsApp que reducen un 30 % las ausencias y te ahorran 6 horas de teléfono a la semana, sin cambiar de software». ¿La añado a la plantilla en el bloque “Diferencial”?" },
];
