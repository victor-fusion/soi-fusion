"use client";

import { useSyncExternalStore } from "react";
import { REVIEW_QUEUE } from "../_data";

// Estado en memoria de la cola (solo prototipo): permite que el contador del menú baje al resolver.
let resolved = new Set<string>();
const listeners = new Set<() => void>();

export function resolveReview(id: string) {
  resolved = new Set(resolved).add(id);
  listeners.forEach((l) => l());
}

export function useResolved() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => resolved,
    () => resolved,
  );
}

export function usePendingCount() {
  const r = useResolved();
  return REVIEW_QUEUE.filter((q) => !r.has(q.id)).length;
}
