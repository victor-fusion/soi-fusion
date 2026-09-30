// Endpoint MCP de SOI (única API route del proyecto: los clientes MCP necesitan HTTP).
import { handler } from "@/lib/mcp/server";

export const maxDuration = 60;

export { handler as GET, handler as POST, handler as DELETE };
