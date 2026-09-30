// RFC 9728: indica a los clientes MCP qué servidor OAuth emite los tokens (Supabase Auth).
import { metadataCorsOptionsRequestHandler, protectedResourceHandler } from "mcp-handler";
import { AUTH_ISSUER } from "@/lib/mcp/context";

const handler = protectedResourceHandler({ authServerUrls: [AUTH_ISSUER] });
const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
