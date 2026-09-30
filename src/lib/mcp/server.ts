import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifySupabaseToken } from "./context";
import { registerCarteraTools } from "./tools/cartera";
import { registerEntregablesTools } from "./tools/entregables";
import { registerSeguimientoTools } from "./tools/seguimiento";

const INSTRUCTIONS = `SOI es el sistema operativo de Fusión Startups, un venture builder de Sevilla.
Cada startup recorre un ciclo de 6 fases (Descubrir, Solucionar, Activar, Vender, Escalar, Consolidar) con entregables
por área (Estrategia, Producto, Growth, Finanzas, Legal, Operaciones, Equipo). Hay 2 ciclos al año (batch 1, 2, 3…).
Flujo de un entregable: pendiente → en_progreso → en_revision (lo envía el founder) → completado o cambios_solicitados (lo decide Fusión).

Pautas:
- Si el usuario nombra una fase, área o entregable de forma aproximada, usa 'catalogo' para obtener el valor exacto.
- Los datos respetan los permisos del usuario: un founder solo ve su startup; el equipo de Fusión ve todo.
- Si una respuesta depende de datos registrados desde hace poco (historial, fechas de envío/aprobación), avísalo.
- Responde en español, con cifras concretas y sin inventar datos que las herramientas no devuelvan.`;

const mcpHandler = createMcpHandler(
  (server) => {
    registerCarteraTools(server);
    registerEntregablesTools(server);
    registerSeguimientoTools(server);
  },
  {
    serverInfo: { name: "soi-fusion", version: "1.0.0" },
    instructions: INSTRUCTIONS,
  }
);

/** Handler del endpoint MCP: exige un token OAuth válido de Supabase. */
export const handler = withMcpAuth(mcpHandler, verifySupabaseToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource/api/mcp",
});
