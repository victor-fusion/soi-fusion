-- ============================================================
-- Seed 002: Template demo — ICP v1 (Growth > ICP y Buyer Persona)
-- Ejecutar DESPUÉS de la migración 003
-- ============================================================

insert into public.cards (section_id, title, description, type, "order", is_active, template_fields)
values (
  'icp',
  'ICP v1 — Perfil del Cliente Ideal',
  'Define con precisión a quién le vendes. Un ICP bien hecho ahorra semanas de prospección fallida.',
  'template',
  1,
  true,
  '[
    {
      "id": "segmento",
      "type": "text",
      "label": "Segmento objetivo",
      "hint": "¿A quién le vendes exactamente? Sé específico.",
      "placeholder": "Ej: Responsables de marketing en empresas de servicios B2B",
      "required": true
    },
    {
      "id": "rol",
      "type": "text",
      "label": "Cargo / Rol del decisor",
      "hint": "¿Quién toma o influye en la decisión de compra?",
      "placeholder": "Ej: CMO, Head of Growth, CEO de empresa pequeña",
      "required": true
    },
    {
      "id": "empresa",
      "type": "text",
      "label": "Tipo de empresa",
      "hint": "Sector, tamaño en empleados, etapa de madurez.",
      "placeholder": "Ej: SaaS B2B, 10-50 empleados, etapa seed o Serie A",
      "required": true
    },
    {
      "id": "problema",
      "type": "textarea",
      "label": "Problema principal que resuelves",
      "hint": "Descríbelo en sus propias palabras, no en las tuyas.",
      "placeholder": "Ej: No saben cuántos de sus leads son realmente cualificados hasta que han gastado horas en demos inútiles.",
      "required": true
    },
    {
      "id": "situacion_actual",
      "type": "textarea",
      "label": "¿Cómo lo resuelven hoy sin ti?",
      "hint": "Qué herramienta, proceso o workaround usan ahora.",
      "placeholder": "Ej: Lo gestionan manualmente en Excel o directamente no lo miden.",
      "required": false
    },
    {
      "id": "gana",
      "type": "textarea",
      "label": "¿Qué gana con tu solución?",
      "hint": "Resultado concreto: tiempo, dinero, riesgo, status.",
      "placeholder": "Ej: Ahorra 5 horas semanales y aumenta la tasa de cierre un 30%.",
      "required": false
    },
    {
      "id": "senales",
      "type": "textarea",
      "label": "Señales de que es buen fit",
      "hint": "¿Qué dice o hace alguien que es tu ICP ideal?",
      "placeholder": "Ej: Ya tiene CRM activo, ha probado alternativas y las ha dejado, habla de cualificación como problema.",
      "required": false
    }
  ]'::jsonb
);
