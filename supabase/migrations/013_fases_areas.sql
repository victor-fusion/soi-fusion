-- ─── PHASES ──────────────────────────────────────────────────────────────────
CREATE TABLE phases (
  id         SERIAL PRIMARY KEY,
  number     INT  UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed from constants
INSERT INTO phases (number, name, color) VALUES
  (1, 'Descubrir',   '#2563EB'),
  (2, 'Solucionar',  '#D97706'),
  (3, 'Activar',     '#EA580C'),
  (4, 'Vender',      '#16A34A'),
  (5, 'Escalar',     '#7C3AED'),
  (6, 'Consolidar',  '#DB2777');

-- ─── AREAS ───────────────────────────────────────────────────────────────────
CREATE TABLE areas (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6b7280',
  sort_order INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE area_sections (
  id         TEXT NOT NULL,
  area_id    TEXT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  sort_order INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (id, area_id)
);

-- Seed areas
INSERT INTO areas (id, name, color, sort_order) VALUES
  ('estrategia', 'Estrategia', '#16A34A', 1),
  ('producto',   'Producto',   '#2563EB', 2),
  ('growth',     'Growth',     '#EA580C', 3),
  ('finanzas',   'Finanzas',   '#7C3AED', 4),
  ('legal',      'Legal',      '#DB2777', 5),
  ('operaciones','Operaciones','#D97706',  6),
  ('equipo',     'Equipo',     '#0D9488',  7);

-- Seed sections
INSERT INTO area_sections (id, area_id, name, sort_order) VALUES
  ('problema',            'estrategia', 'Problema',              1),
  ('solucion',            'estrategia', 'Solución',              2),
  ('modelo',              'estrategia', 'Modelo de Negocio',     3),
  ('mercado',             'estrategia', 'Mercado',               4),
  ('validacion',          'estrategia', 'Validación',            5),
  ('discovery',           'producto',   'Discovery',             1),
  ('diseno',              'producto',   'Diseño y Prototipado',  2),
  ('mvp',                 'producto',   'MVP',                   3),
  ('validacion_producto', 'producto',   'Validación de Producto',4),
  ('iteracion',           'producto',   'Iteración',             5),
  ('icp',                 'growth',     'ICP y Buyer Persona',   1),
  ('marketing',           'growth',     'Marketing',             2),
  ('ventas',              'growth',     'Ventas',                3),
  ('customer_success',    'growth',     'Customer Success',      4),
  ('escalado',            'growth',     'Escalado',              5),
  ('unit_economics',      'finanzas',   'Unit Economics',        1),
  ('modelo_financiero',   'finanzas',   'Modelo Financiero',     2),
  ('gestion',             'finanzas',   'Gestión Financiera',    3),
  ('fundraising',         'finanzas',   'Fundraising',           4),
  ('ayudas',              'finanzas',   'Ayudas y Subvenciones', 5),
  ('constitucion',        'legal',      'Constitución',          1),
  ('pactos',              'legal',      'Pactos y Equity',       2),
  ('pi',                  'legal',      'Propiedad Intelectual', 3),
  ('datos',               'legal',      'Protección de Datos',   4),
  ('contratos',           'legal',      'Contratos',             5),
  ('procesos',            'operaciones','Procesos',              1),
  ('stack',               'operaciones','Herramientas y Stack',  2),
  ('automatizacion',      'operaciones','Automatización',        3),
  ('okrs',                'operaciones','Métricas y OKRs',       4),
  ('cofundadores',        'equipo',     'Cofundadores',          1),
  ('hiring',              'equipo',     'Hiring',                2),
  ('cultura',             'equipo',     'Cultura',               3),
  ('advisors',            'equipo',     'Advisors',              4);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE phases       ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_sections ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer
CREATE POLICY "phases: todos pueden leer"
  ON phases FOR SELECT USING (true);

CREATE POLICY "areas: todos pueden leer"
  ON areas FOR SELECT USING (true);

CREATE POLICY "area_sections: todos pueden leer"
  ON area_sections FOR SELECT USING (true);

-- Solo admins pueden escribir
CREATE POLICY "phases: solo admins pueden escribir"
  ON phases FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "areas: solo admins pueden escribir"
  ON areas FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "area_sections: solo admins pueden escribir"
  ON area_sections FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
