"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Persistencia de filtros en los listados:
 * - Los filtros viven en la URL (?area=…&q=…), así sobreviven al botón atrás.
 * - Cada listado guarda su última URL en sessionStorage (useRememberListUrl).
 * - El "Volver" de las fichas (BackToList) vuelve a esa URL con los filtros.
 */

const storageKey = (basePath: string) => `soi:list:${basePath}`;

/** Construye la URL con los cambios aplicados; valores vacíos o por defecto se eliminan. */
export function buildUrl(
  pathname: string,
  current: URLSearchParams,
  patch: Record<string, string | number | null | undefined>,
  { resetPage = true }: { resetPage?: boolean } = {}
): string {
  const params = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === "" || v === 0) params.delete(k);
    else params.set(k, String(v));
  }
  if (resetPage) params.delete("page");
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/**
 * Filtros de cliente sincronizados con la URL sin volver a pedir la página al servidor
 * (history.replaceState se integra con useSearchParams en Next).
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const values = Object.fromEntries(keys.map((k) => [k, searchParams.get(k) ?? ""])) as Record<K, string>;

  const setFilters = (patch: Partial<Record<K, string | number | null>>) => {
    window.history.replaceState(null, "", buildUrl(pathname, searchParams, patch, { resetPage: false }));
  };

  return [values, setFilters] as const;
}

/** Guarda la URL actual del listado (con filtros) para poder volver a ella desde una ficha. */
export function useRememberListUrl(basePath: string) {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(basePath), qs ? `${basePath}?${qs}` : basePath);
    } catch {
      // sessionStorage no disponible: el "Volver" usará el listado sin filtros
    }
  }, [basePath, qs]);
}

/** Enlace "Volver" que restaura el listado con los filtros que tenía. */
export function BackToList({
  basePath,
  children,
  style,
}: {
  basePath: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Clic normal: ir a la última URL guardada del listado. Cmd/Ctrl+clic: comportamiento por defecto.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    try {
      const saved = sessionStorage.getItem(storageKey(basePath));
      if (saved?.startsWith(basePath) && saved !== basePath) {
        e.preventDefault();
        router.push(saved);
      }
    } catch {
      // sin sessionStorage: navegación normal a basePath
    }
  };

  return (
    <Link href={basePath} onClick={handleClick} style={style}>
      {children}
    </Link>
  );
}
