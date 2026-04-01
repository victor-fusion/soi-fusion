-- ============================================================
-- Migración 007: Templates de entregables genéricos
-- Se crean una vez como plantillas y se copian a cada startup
-- al crearla mediante un trigger.
-- ============================================================

-- ─── TABLA DE PLANTILLAS ─────────────────────────────────────
create table if not exists public.entregable_templates (
  id          uuid default uuid_generate_v4() primary key,
  title       text not null,
  description text,
  area        text not null,
  section     text not null,
  phase       integer not null check (phase between 1 and 6),
  "order"     integer default 0,
  steps       text[] default '{}',
  is_active   boolean default true,
  created_at  timestamptz default now()
);

alter table public.entregable_templates enable row level security;

-- Solo admins gestionan las plantillas; todos los autenticados las leen
create policy "Usuarios autenticados ven templates" on public.entregable_templates
  for select using (auth.role() = 'authenticated' and is_active = true);

create policy "Admins gestionan templates" on public.entregable_templates
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ─── INSERTAR LOS 46 ENTREGABLES GENÉRICOS ───────────────────

insert into public.entregable_templates (title, description, area, section, phase, "order") values

-- ── FASE 1: Descubrir ──────────────────────────────────────────
('Tabla de valor',
 'Matriz que cruza el problema detectado con el valor que tu solución aporta al cliente ideal. Base para construir la propuesta de valor.',
 'estrategia', 'problema', 1, 1),

('Frase de valor validada',
 'Una frase clara y directa que explica qué haces, para quién y qué problema resuelves. Debe sobrevivir el test de "lo entiendo en 10 segundos".',
 'estrategia', 'solucion', 1, 2),

('ICP v1 definido',
 'Perfil del cliente ideal (Ideal Customer Profile): sector, tamaño, rol, dolor principal y criterios de compra. Primera versión basada en hipótesis.',
 'growth', 'icp', 1, 3),

('Bitácora de entrevistas',
 'Registro estructurado de las 15–30 entrevistas Mom Test realizadas: participante, fecha, insights clave y señales de validación o invalidación.',
 'growth', 'icp', 1, 4),

('User Journey mapeado',
 'Mapa del recorrido del usuario desde que detecta su problema hasta que busca una solución. Identifica fricciones y momentos clave de decisión.',
 'producto', 'discovery', 1, 5),

('Hipótesis de ticket y margen',
 'Primera estimación del precio que el cliente pagaría y del margen bruto que dejaría esa venta. No es pricing final, es hipótesis de trabajo.',
 'finanzas', 'unit_economics', 1, 6),

('Análisis de implicaciones legales',
 'Revisión inicial de si el modelo de negocio tiene restricciones regulatorias, requiere licencias o afecta datos personales (RGPD).',
 'legal', 'constitucion', 1, 7),

('Mapa de roles del equipo',
 'Clarificación de quién hace qué en el equipo fundador: responsabilidades por área, huecos identificados y naming inicial de la empresa.',
 'equipo', 'cofundadores', 1, 8),

-- ── FASE 2: Solucionar ────────────────────────────────────────
('Propuesta diferenciada',
 'Versión refinada de la propuesta de valor que destaca el diferencial frente a alternativas del mercado. Debe superar la objeción "¿por qué tú y no X?".',
 'estrategia', 'solucion', 2, 1),

('Mockup navegable validado',
 'Prototipo visual (Figma u otra herramienta) que simula la experiencia del producto y ha sido mostrado y comentado por al menos 5 ICPs.',
 'producto', 'diseno', 2, 2),

('Pricing v1',
 'Primera versión del modelo de precios: estructura (suscripción, pago único, comisión…), rango de precios y justificación basada en valor percibido.',
 'finanzas', 'modelo_financiero', 2, 3),

('Lista de 100 ICPs',
 'Base de datos de 100 contactos que encajan con el perfil de cliente ideal: nombre, empresa, cargo y canal de contacto identificado.',
 'growth', 'icp', 2, 4),

('Scripts de prospección enviados',
 'Mensajes de primer contacto redactados y enviados a los ICPs de la lista. Incluye variantes probadas y métricas de respuesta inicial.',
 'growth', 'ventas', 2, 5),

('Waitlist activa',
 'Lista de interesados captados a través de la landing page u outreach. Indica demanda real antes de tener producto. Objetivo: mínimo 20 registros.',
 'growth', 'marketing', 2, 6),

('NDA y condiciones de uso',
 'Documentos legales básicos para proteger la información compartida con ICPs y pilotos: acuerdo de confidencialidad y términos iniciales.',
 'legal', 'contratos', 2, 7),

('Identidad de marca inicial',
 'Logo, paleta de colores, tono de comunicación y bio del proyecto. No tiene que ser perfecta, tiene que ser coherente y presentable.',
 'equipo', 'cultura', 2, 8),

('Landing page activa',
 'Página web publicada con la propuesta de valor, CTA claro (waitlist, demo o contacto) y analítica básica instalada (GA4 o similar).',
 'growth', 'marketing', 2, 9),

-- ── FASE 3: Activar ───────────────────────────────────────────
('MVP funcional o simulado',
 'Versión mínima del producto que permite demostrar el valor central. Puede ser funcional o simulado (Wizard of Oz) si resuelve el problema del cliente.',
 'producto', 'mvp', 3, 1),

('Narrativa de venta ajustada',
 'Script o guión de la demo comercial, refinado con las objeciones y preguntas recibidas. Estructura: problema → solución → prueba → llamada a la acción.',
 'estrategia', 'solucion', 3, 2),

('15 demos realizadas',
 'Registro de al menos 15 demos o presentaciones del MVP a ICPs, con notas de cada sesión: reacciones, objeciones y nivel de interés detectado.',
 'growth', 'ventas', 3, 3),

('Feedback de demos documentado',
 'Síntesis de los insights cualitativos recogidos en demos: qué gusta, qué no convence, qué falta y qué objeciones se repiten con más frecuencia.',
 'producto', 'validacion_producto', 3, 4),

('CRM activo con pipeline',
 'Herramienta CRM configurada y en uso con los contactos del funnel de ventas clasificados por etapa: lead → demo → propuesta → cierre.',
 'growth', 'ventas', 3, 5),

('Pricing ajustado + CAC estimado',
 'Revisión del pricing tras las demos (¿el precio convence o bloquea?) y primera estimación del Coste de Adquisición de Cliente basada en tiempo y recursos invertidos.',
 'finanzas', 'unit_economics', 3, 6),

('Contrato demo / piloto',
 'Documento que formaliza las condiciones de un piloto o demo remunerada: alcance, duración, precio simbólico y cláusulas de confidencialidad.',
 'legal', 'contratos', 3, 7),

('Primer contenido publicado',
 'Al menos 3 piezas de contenido publicadas en redes o blog relacionadas con el problema que resuelves. Construye autoridad y atrae ICPs orgánicamente.',
 'equipo', 'cultura', 3, 8),

-- ── FASE 4: Vender ────────────────────────────────────────────
('Primera venta o piloto cerrado',
 'Al menos un cliente que ha pagado por el producto o servicio, aunque sea un precio reducido de piloto. La señal más fuerte de validación real.',
 'growth', 'ventas', 4, 1),

('Playbook comercial v1',
 'Documento que recoge el proceso de venta replicable: ICP objetivo, canal, secuencia de contacto, argumentario, gestión de objeciones y cierre.',
 'growth', 'ventas', 4, 2),

('Funnel de ventas documentado',
 'Mapa del embudo completo con tasas de conversión reales por etapa: visitante → lead → demo → propuesta → cliente. Base para mejorar.',
 'growth', 'ventas', 4, 3),

('Caso de éxito documentado',
 'Historia del primer cliente: su problema, cómo lo resolviste, resultado obtenido y testimonio (si lo da). Herramienta de ventas muy potente.',
 'growth', 'customer_success', 4, 4),

('MVP 1.5 con onboarding',
 'Versión mejorada del MVP que incorpora el feedback de los primeros usuarios e incluye un proceso de onboarding claro para reducir la fricción de adopción.',
 'producto', 'iteracion', 4, 5),

('CAC y LTV iniciales',
 'Cálculo del Coste de Adquisición de Cliente (CAC) y del Valor del Ciclo de Vida del cliente (LTV) con datos reales de las primeras ventas.',
 'finanzas', 'unit_economics', 4, 6),

('Métricas iniciales registradas',
 'Dashboard básico con los KPIs clave activos: MRR, número de clientes, CAC, tasa de retención y cualquier métrica específica del modelo.',
 'finanzas', 'gestion', 4, 7),

('Facturación activa',
 'Proceso de emisión de facturas operativo: herramienta configurada, primer invoice emitido y cobro recibido. Confirma viabilidad del modelo de ingresos.',
 'finanzas', 'gestion', 4, 8),

-- ── FASE 5: Escalar ───────────────────────────────────────────
('Canal de adquisición validado',
 'Al menos un canal de captación de clientes que funciona de forma replicable: LinkedIn, SEO, paid, eventos, referidos… con métricas que lo prueban.',
 'growth', 'escalado', 5, 1),

('Campaña o partnership activo',
 'Iniciativa de crecimiento en marcha: campaña de paid media, acuerdo con partner comercial o programa de referidos orientado a escalar clientes.',
 'growth', 'escalado', 5, 2),

('Diferencial reforzado',
 'Posicionamiento actualizado que incorpora los aprendizajes del ciclo: qué te hace único, por qué ahora y por qué tú. Debe resistir comparaciones directas.',
 'estrategia', 'mercado', 5, 3),

('Optimización técnica del producto',
 'Mejoras de rendimiento, estabilidad y escalabilidad del producto basadas en feedback de usuarios reales. El producto ya no es un MVP, es una versión 1.0.',
 'producto', 'iteracion', 5, 4),

('Proyección financiera 12 meses',
 'Modelo financiero que proyecta ingresos, gastos, márgenes y runway a 12 meses. Incluye escenario conservador, base y optimista con sus supuestos.',
 'finanzas', 'modelo_financiero', 5, 5),

('Automatización mínima activa',
 'Al menos un proceso clave automatizado (onboarding, facturación, seguimiento de leads, reporting) que libera tiempo del equipo para escalar.',
 'operaciones', 'automatizacion', 5, 6),

('Data room preparado',
 'Carpeta con documentación para inversores: pitch deck, proyección financiera, cap table, contratos clave y métricas del negocio. Listo para compartir.',
 'legal', 'contratos', 5, 7),

('Pitch deck v1 con métricas',
 'Presentación inversora de 10–12 slides con el problema, solución, mercado, tracción real, equipo, modelo financiero y ask. Validado con feedback externo.',
 'equipo', 'cultura', 5, 8),

-- ── FASE 6: Consolidar ────────────────────────────────────────
('Plan operativo post-Fusión',
 'Hoja de ruta de los próximos 6–12 meses: objetivos, hitos, recursos necesarios y responsables. Define cómo continúa el crecimiento sin el programa.',
 'estrategia', 'modelo', 6, 1),

('Funnel predecible documentado',
 'Proceso de ventas con métricas estables que permiten predecir cuántos clientes nuevos se pueden cerrar por mes dado un nivel de actividad comercial.',
 'growth', 'escalado', 6, 2),

('Dashboard de métricas completo',
 'Panel de control con todos los KPIs del negocio actualizados: MRR, CAC, LTV, burn rate, runway y métricas específicas del modelo. Visible para el equipo.',
 'finanzas', 'gestion', 6, 3),

('Burn rate y runway calculados',
 'Cuánto dinero gasta la empresa al mes (burn rate) y cuántos meses puede operar con el capital actual (runway). Esencial para decisiones de inversión.',
 'finanzas', 'gestion', 6, 4),

('Pipeline inversor activo',
 'Lista de inversores contactados o en conversación, con su estado de avance. Al menos 10 inversores identificados y 3 reuniones confirmadas o realizadas.',
 'finanzas', 'fundraising', 6, 5),

('SL y contratos consolidados',
 'Sociedad Limitada constituida (si no lo estaba), contratos con clientes en vigor, acuerdos con proveedores clave y pacto de socios actualizado.',
 'legal', 'constitucion', 6, 6),

('MVP estable y mantenible',
 'El producto funciona de forma fiable, tiene documentación técnica básica y puede ser mantenido o ampliado por el equipo sin dependencias críticas.',
 'producto', 'mvp', 6, 7),

('Kit inversor completo',
 'Conjunto de materiales listos para una ronda: pitch deck final, one-pager, data room, proyección financiera y teaser de email. Todo coherente y pulido.',
 'equipo', 'cultura', 6, 8);


-- ─── FUNCIÓN: asignar entregables a una startup nueva ─────────
create or replace function public.assign_entregables_to_startup()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.entregables (
    startup_id, title, description, area, section, phase, "order", steps, status
  )
  select
    new.id,
    t.title,
    t.description,
    t.area,
    t.section,
    t.phase,
    t."order",
    t.steps,
    'pending'
  from public.entregable_templates t
  where t.is_active = true;

  return new;
end;
$$;

-- ─── TRIGGER: ejecutar al crear startup ──────────────────────
-- Primero eliminar si ya existe (safe re-run)
drop trigger if exists on_startup_created_assign_entregables on public.startups;

create trigger on_startup_created_assign_entregables
  after insert on public.startups
  for each row execute function public.assign_entregables_to_startup();


-- ─── COLUMNA order en entregables (si no existe) ─────────────
-- Añade la columna order a entregables para poder ordenar por fase
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'entregables' and column_name = 'order'
  ) then
    alter table public.entregables add column "order" integer default 0;
  end if;
end;
$$;


-- ─── BACKFILL: asignar entregables a startups ya existentes ──
-- Solo inserta para startups que todavía no tienen ningún entregable
-- (evita duplicados si la migración se re-ejecuta parcialmente)
insert into public.entregables (
  startup_id, title, description, area, section, phase, "order", steps, status
)
select
  s.id,
  t.title,
  t.description,
  t.area,
  t.section,
  t.phase,
  t."order",
  t.steps,
  'pending'
from public.startups s
cross join public.entregable_templates t
where t.is_active = true
  and not exists (
    select 1 from public.entregables e
    where e.startup_id = s.id
  );
