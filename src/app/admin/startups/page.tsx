import { createClient } from "@/lib/supabase/server";
import { getPhases } from "@/lib/data/phases";
import { getCycles } from "@/lib/data/cycles";
import type { Startup } from "@/types";
import { StartupsClient } from "./_components/StartupsClient";

const PER_PAGE = 15;

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string; page?: string; q?: string }>;
}) {
  const { batch: batchParam, page: pageParam, q: qParam } = await searchParams;
  const searchTerm = (qParam ?? "").trim();
  const supabase = await createClient();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const offset = (page - 1) * PER_PAGE;

  const selectedBatch = batchParam !== undefined ? parseInt(batchParam, 10) : 0;
  const showAll = selectedBatch === 0;

  let countQuery = supabase.from("startups").select("*", { count: "exact", head: true });
  if (!showAll) countQuery = countQuery.eq("batch", selectedBatch);
  if (searchTerm) countQuery = countQuery.ilike("name", `%${searchTerm}%`);

  let query = supabase
    .from("startups")
    .select("*")
    .order("batch", { ascending: false })
    .order("name")
    .range(offset, offset + PER_PAGE - 1);
  if (!showAll) query = query.eq("batch", selectedBatch);
  if (searchTerm) query = query.ilike("name", `%${searchTerm}%`);

  const [phases, cycles, { data: batchRows }, { count: totalCount }, { data: startups }] = await Promise.all([
    getPhases(),
    getCycles(),
    supabase.from("startups").select("batch").order("batch"),
    countQuery,
    query,
  ]);

  const availableBatches = [...new Set((batchRows ?? []).map((r: { batch: number }) => r.batch))].sort((a, b) => a - b) as number[];
  const allStartups = (startups ?? []) as Startup[];
  const total = totalCount ?? 0;

  const startupIds = allStartups.map((s) => s.id);
  const { data: entregables } = startupIds.length > 0
    ? await supabase.from("entregables").select("startup_id, status, phase").in("startup_id", startupIds)
    : { data: [] };

  const progressMap = Object.fromEntries(
    allStartups.map((s) => {
      const mine = (entregables ?? []).filter(
        (e: { startup_id: string; phase: number; status: string }) =>
          e.startup_id === s.id && e.phase === s.current_phase
      );
      const done = mine.filter((e: { status: string }) => e.status === "completado").length;
      const pct = mine.length > 0 ? Math.round((done / mine.length) * 100) : 0;
      return [s.id, { done, total: mine.length, pct }];
    })
  );

  return (
    <StartupsClient
      startups={allStartups}
      phases={phases}
      progressMap={progressMap}
      availableBatches={availableBatches}
      selectedBatch={selectedBatch}
      total={total}
      page={page}
      cycles={cycles}
      query={searchTerm}
    />
  );
}
