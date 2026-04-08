"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Group, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Suspense } from "react";

interface PaginationProps {
  total: number;
  page: number;
  perPage?: number;
}

function PaginationInner({ total, page, perPage = 15 }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const getHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  };

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 32, height: 32, borderRadius: 8, fontSize: 13,
    textDecoration: "none", fontWeight: 500,
  };

  return (
    <Group gap={4} justify="center" mt={24}>
      {page > 1 ? (
        <Link href={getHref(page - 1)} style={{ ...btnBase, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#374151" }}>
          <IconChevronLeft size={14} />
        </Link>
      ) : (
        <span style={{ ...btnBase, border: "1px solid #f3f4f6", backgroundColor: "#fafafa", color: "#d1d5db" }}>
          <IconChevronLeft size={14} />
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <Text key={`dots-${i}`} style={{ fontSize: 13, color: "#9ca3af", width: 32, textAlign: "center" }}>…</Text>
        ) : (
          <Link
            key={p}
            href={getHref(p as number)}
            style={{
              ...btnBase,
              border: p === page ? "none" : "1px solid #e5e7eb",
              backgroundColor: p === page ? "#111827" : "#fff",
              color: p === page ? "#fff" : "#374151",
            }}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={getHref(page + 1)} style={{ ...btnBase, border: "1px solid #e5e7eb", backgroundColor: "#fff", color: "#374151" }}>
          <IconChevronRight size={14} />
        </Link>
      ) : (
        <span style={{ ...btnBase, border: "1px solid #f3f4f6", backgroundColor: "#fafafa", color: "#d1d5db" }}>
          <IconChevronRight size={14} />
        </span>
      )}
    </Group>
  );
}

export function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={null}>
      <PaginationInner {...props} />
    </Suspense>
  );
}
