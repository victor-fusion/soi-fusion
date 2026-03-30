import type { Area } from "@/types";

export const AREAS: Area[] = [
  {
    id: "estrategia",
    name: "Estrategia",
    color: "#16A34A",
    sections: [
      { id: "problema", area_id: "estrategia", name: "Problema", order: 1, cards: [] },
      { id: "solucion", area_id: "estrategia", name: "Solución", order: 2, cards: [] },
      { id: "modelo", area_id: "estrategia", name: "Modelo de Negocio", order: 3, cards: [] },
      { id: "mercado", area_id: "estrategia", name: "Mercado", order: 4, cards: [] },
      { id: "validacion", area_id: "estrategia", name: "Validación", order: 5, cards: [] },
    ],
  },
  {
    id: "producto",
    name: "Producto",
    color: "#2563EB",
    sections: [
      { id: "discovery", area_id: "producto", name: "Discovery", order: 1, cards: [] },
      { id: "diseno", area_id: "producto", name: "Diseño y Prototipado", order: 2, cards: [] },
      { id: "mvp", area_id: "producto", name: "MVP", order: 3, cards: [] },
      { id: "validacion_producto", area_id: "producto", name: "Validación de Producto", order: 4, cards: [] },
      { id: "iteracion", area_id: "producto", name: "Iteración", order: 5, cards: [] },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    color: "#EA580C",
    sections: [
      { id: "icp", area_id: "growth", name: "ICP y Buyer Persona", order: 1, cards: [] },
      { id: "marketing", area_id: "growth", name: "Marketing", order: 2, cards: [] },
      { id: "ventas", area_id: "growth", name: "Ventas", order: 3, cards: [] },
      { id: "customer_success", area_id: "growth", name: "Customer Success", order: 4, cards: [] },
      { id: "escalado", area_id: "growth", name: "Escalado", order: 5, cards: [] },
    ],
  },
  {
    id: "finanzas",
    name: "Finanzas",
    color: "#7C3AED",
    sections: [
      { id: "unit_economics", area_id: "finanzas", name: "Unit Economics", order: 1, cards: [] },
      { id: "modelo_financiero", area_id: "finanzas", name: "Modelo Financiero", order: 2, cards: [] },
      { id: "gestion", area_id: "finanzas", name: "Gestión Financiera", order: 3, cards: [] },
      { id: "fundraising", area_id: "finanzas", name: "Fundraising", order: 4, cards: [] },
      { id: "ayudas", area_id: "finanzas", name: "Ayudas y Subvenciones", order: 5, cards: [] },
    ],
  },
  {
    id: "legal",
    name: "Legal",
    color: "#DB2777",
    sections: [
      { id: "constitucion", area_id: "legal", name: "Constitución", order: 1, cards: [] },
      { id: "pactos", area_id: "legal", name: "Pactos y Equity", order: 2, cards: [] },
      { id: "pi", area_id: "legal", name: "Propiedad Intelectual", order: 3, cards: [] },
      { id: "datos", area_id: "legal", name: "Protección de Datos", order: 4, cards: [] },
      { id: "contratos", area_id: "legal", name: "Contratos", order: 5, cards: [] },
    ],
  },
  {
    id: "operaciones",
    name: "Operaciones",
    color: "#D97706",
    sections: [
      { id: "procesos", area_id: "operaciones", name: "Procesos", order: 1, cards: [] },
      { id: "stack", area_id: "operaciones", name: "Herramientas y Stack", order: 2, cards: [] },
      { id: "automatizacion", area_id: "operaciones", name: "Automatización", order: 3, cards: [] },
      { id: "okrs", area_id: "operaciones", name: "Métricas y OKRs", order: 4, cards: [] },
    ],
  },
  {
    id: "equipo",
    name: "Equipo",
    color: "#0D9488",
    sections: [
      { id: "cofundadores", area_id: "equipo", name: "Cofundadores", order: 1, cards: [] },
      { id: "hiring", area_id: "equipo", name: "Hiring", order: 2, cards: [] },
      { id: "cultura", area_id: "equipo", name: "Cultura", order: 3, cards: [] },
      { id: "advisors", area_id: "equipo", name: "Advisors", order: 4, cards: [] },
    ],
  },
];

export const AREA_MAP = Object.fromEntries(AREAS.map((a) => [a.id, a]));
export const AREA_COLORS = Object.fromEntries(AREAS.map((a) => [a.name, a.color]));

export const MONTHS = [
  { number: 1, name: "Descubrir y Definir", color: "#2563EB" },
  { number: 2, name: "Solucionar y Conectar", color: "#D97706" },
  { number: 3, name: "Activar y Demostrar", color: "#EA580C" },
  { number: 4, name: "Vender y Medir", color: "#16A34A" },
  { number: 5, name: "Escalar y Convencer", color: "#7C3AED" },
  { number: 6, name: "Consolidar y Proyectar", color: "#DB2777" },
];
