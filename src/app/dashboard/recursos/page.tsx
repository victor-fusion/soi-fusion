import Link from "next/link";
import { AREAS } from "@/constants/areas";
import { Box, Text, Title, SimpleGrid } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

export default function ArsenalPage() {
  return (
    <Box p={40} maw={900} mx="auto">

      <Box mb={40}>
        <Text style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Recursos y herramientas</Text>
        <Title order={1} style={{ fontSize: "2rem", color: "#111827", marginTop: 4 }}>
          Recursos
        </Title>
      </Box>

      <SimpleGrid cols={2} spacing={16}>
        {AREAS.map((area) => (
          <Link
            key={area.id}
            href={`/dashboard/arsenal/${area.id}`}
            style={{ textDecoration: "none" }}
          >
            <Box
              p={24}
              style={{
                borderRadius: 16,
                border: "1px solid #f3f4f6",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 16,
                transition: "border-color 0.15s, box-shadow 0.15s",
                cursor: "pointer",
              }}
            >
              <Box
                style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  backgroundColor: `${area.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Box style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: area.color }} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                  {area.name}
                </Text>
                <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  {area.sections.length} secciones
                </Text>
              </Box>
              <IconArrowRight size={16} color="#d1d5db" style={{ flexShrink: 0 }} />
            </Box>
          </Link>
        ))}
      </SimpleGrid>
    </Box>
  );
}
