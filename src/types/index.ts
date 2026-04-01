// ─── ROLES ───────────────────────────────────────────────────────────────────
export type UserRole = "founder" | "admin";

// ─── STARTUP ─────────────────────────────────────────────────────────────────
export type StartupType = "b2b_saas" | "b2c_app" | "marketplace" | "producto_fisico" | "servicios";
export type StartupStatus = "activa" | "en_pausa" | "en_revision" | "inactiva" | "cerrada";

export interface Startup {
  id: string;
  name: string;
  logo_url?: string;
  tagline?: string;
  sector?: string;
  type: StartupType;
  status: StartupStatus;
  batch: number;
  current_phase: number; // 1-6
  cycle_start_date?: string; // ISO date string, e.g. "2026-04-01"
  created_at: string;
  updated_at: string;
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export type MemberType = "cofundador" | "empleado" | "advisor" | "becario" | "contratista";
export type MemberDedication = "full-time" | "part-time" | "puntual";

export interface DaySchedule {
  start: string; // "09:00"
  end: string;   // "18:00"
}

export interface OfficeSchedule {
  monday?:    DaySchedule[];
  tuesday?:   DaySchedule[];
  wednesday?: DaySchedule[];
  thursday?:  DaySchedule[];
  friday?:    DaySchedule[];
  saturday?:  DaySchedule[];
  sunday?:    DaySchedule[];
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  startup_id?: string;
  avatar_url?: string;
  created_at: string;
  // Campos de equipo (fusionados desde startup_members)
  role_title?: string;
  member_type?: MemberType;
  dedication?: MemberDedication;
  office_schedule: OfficeSchedule;
  joined_at?: string;
  phone?: string;
  linkedin_url?: string;
  calendar_url?: string;
  display_order: number;
}

// ─── ENTREGABLE TEMPLATES (MAESTROS) ─────────────────────────────────────────
export interface EntregableTemplate {
  id: string;
  title: string;
  description?: string;
  area: string;
  section: string;
  phase: number; // 1-6
  order: number;
  tipo: EntregableTipo;
  file_slots: FileSlot[];
  is_active: boolean;
  created_at: string;
}

// ─── ENTREGABLES ─────────────────────────────────────────────────────────────
export type EntregableStatus =
  | "pendiente"
  | "en_progreso"
  | "en_revision"
  | "cambios_solicitados"
  | "completado";

export type EntregableTipo =
  | "archivos"
  | "formulario"
  | "link"
  | "checklist"
  | "externo";

export interface FileSlot {
  label: string;
  required: boolean;
}

export interface Entregable {
  id: string;
  startup_id: string;
  template_id?: string | null;
  title: string;
  description?: string;
  area: string;
  section: string;
  phase: number; // 1-6
  week?: number;
  status: EntregableStatus;
  tipo: EntregableTipo;
  file_slots: FileSlot[];
  reviewer_notes?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface EntregableComment {
  id: string;
  entregable_id: string;
  author_id: string | null;
  parent_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  // joined
  author?: { full_name: string; avatar_url?: string; role: string };
  replies?: EntregableComment[];
}

// ─── ÁREAS ───────────────────────────────────────────────────────────────────
export interface Area {
  id: string;
  name: string;
  color: string;
  sections: Section[];
}

export interface Section {
  id: string;
  area_id: string;
  name: string;
  order: number;
  cards: Card[];
}

// ─── TARJETAS DE CONTENIDO ───────────────────────────────────────────────────
export type CardType =
  | "playbook"
  | "template"
  | "tool"
  | "ai_tool"
  | "checklist"
  | "resource"
  | "external_link"
  | "agent";

export interface TemplateField {
  id: string;
  type: "text" | "textarea";
  label: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
}

export interface Card {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  type: CardType;
  content?: string; // markdown content
  url?: string;
  template_fields?: TemplateField[];
  order: number;
  is_active: boolean;
  created_at: string;
}


// ─── CRM ─────────────────────────────────────────────────────────────────────
export type ContactStage =
  | "contacto_inicial"
  | "demo"
  | "propuesta"
  | "negociacion"
  | "cerrado_ganado"
  | "cerrado_perdido";

export type ContactSource = "linkedin" | "agente_ia" | "evento" | "referido" | "cold_email" | "otro";

export interface Contact {
  id: string;
  startup_id: string;
  full_name: string;
  company: string;
  role: string;
  email?: string;
  linkedin_url?: string;
  stage: ContactStage;
  deal_value?: number;
  source: ContactSource;
  last_contact_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── AGENTE SDR ──────────────────────────────────────────────────────────────
export type AgentTaskStatus = "pending_approval" | "approved" | "running" | "completed" | "rejected";

export interface AgentTask {
  id: string;
  startup_id: string;
  agent_type: "sdr" | "content" | "analyst";
  status: AgentTaskStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

// ─── WEEKLY ──────────────────────────────────────────────────────────────────
export interface Weekly {
  id: string;
  startup_id: string;
  date: string;
  agenda: string[];
  action_items: ActionItem[];
  notes?: string;
  created_at: string;
}

export interface ActionItem {
  id: string;
  text: string;
  owner: string;
  due_date?: string;
  done: boolean;
}
