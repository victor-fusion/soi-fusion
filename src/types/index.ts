// ─── ROLES ───────────────────────────────────────────────────────────────────
export type UserRole = "founder" | "admin";

// ─── STARTUP ─────────────────────────────────────────────────────────────────
export type StartupType = "b2b_saas" | "b2c_app" | "marketplace" | "producto_fisico" | "servicios";
export type StartupStatus = "activa" | "en_pausa" | "en_revision" | "inactiva" | "cerrada";

export interface Startup {
  id: string;
  name: string;
  sector: string;
  type: StartupType;
  status: StartupStatus;
  batch: number;
  current_phase: number; // 1-6
  progress: number; // 0-100
  north_star_metric?: string;
  north_star_value?: string;
  created_at: string;
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  startup_id?: string;
  avatar_url?: string;
  created_at: string;
}

// ─── ENTREGABLES ─────────────────────────────────────────────────────────────
export type EntregableStatus = "pending" | "in_progress" | "done";

export interface Entregable {
  id: string;
  startup_id: string;
  title: string;
  description?: string;
  area: string;
  section: string;
  phase: number; // 1-6
  week?: number;
  status: EntregableStatus;
  deadline?: string;
  steps?: string[];
  completed_steps?: number[];
  created_at: string;
  updated_at: string;
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

export interface Card {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  type: CardType;
  content?: string; // markdown content
  url?: string;
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
