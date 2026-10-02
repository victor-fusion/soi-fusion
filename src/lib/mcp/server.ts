import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifySupabaseToken } from "./context";
import { registerCarteraTools } from "./tools/cartera";
import { registerEntregablesTools } from "./tools/entregables";
import { registerSeguimientoTools } from "./tools/seguimiento";
import { registerEscrituraTools } from "./tools/escritura";
import { registerContactosTools } from "./tools/contactos";

const INSTRUCTIONS = `SOI es el sistema operativo de Fusión Startups, un venture builder de Sevilla.
Cada startup recorre un ciclo de 6 fases (Descubrir, Solucionar, Activar, Vender, Escalar, Consolidar) con entregables
por área (Estrategia, Producto, Growth, Finanzas, Legal, Operaciones, Equipo). Hay 2 ciclos al año (batch 1, 2, 3…).
Flujo de un entregable: pendiente → en_progreso → en_revision (lo envía el founder) → completado o cambios_solicitados (lo decide Fusión).

Pautas:
- Si el usuario nombra una fase, área o entregable de forma aproximada, usa 'catalogo' para obtener el valor exacto.
- Los datos respetan los permisos del usuario: un founder solo ve su startup; el equipo de Fusión ve todo.
- Si una respuesta depende de datos registrados desde hace poco (historial, fechas de envío/aprobación), avísalo.
- Las herramientas de escritura (crear/editar startup, cambiar fase, revisar entregable, registrar métricas o weekly)
  solo funcionan para usuarios autorizados. Antes de usarlas, confirma con el usuario los datos exactos que vas a guardar.
  Salvo contactos y miembros, no hay herramientas para borrar: eso se hace desde la web.
- Hay tres tipos de "contactos": el CRM de cada startup (leads y clientes de esa startup), el CRM de Fusión
  (inversores, partners, mentores… de Fusión) y los miembros del SOI (personas con usuario). Si el usuario
  dice "contacto" y no está claro cuál, pregúntale.
- Ante cualquier duda en una orden de escritura (qué persona, qué startup, qué dato, posible duplicado),
  pregunta antes de ejecutar. Para borrar, muestra antes el registro exacto y pide confirmación explícita.
- Responde en español, con cifras concretas y sin inventar datos que las herramientas no devuelvan.`;

const mcpHandler = createMcpHandler(
  (server) => {
    registerCarteraTools(server);
    registerEntregablesTools(server);
    registerSeguimientoTools(server);
    registerEscrituraTools(server);
    registerContactosTools(server);
  },
  {
    serverInfo: { name: "soi-fusion", version: "1.4.0" },
    instructions: INSTRUCTIONS,
  }
);

/** Handler del endpoint MCP: exige un token OAuth válido de Supabase. */
export const handler = withMcpAuth(mcpHandler, verifySupabaseToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource/api/mcp",
});
