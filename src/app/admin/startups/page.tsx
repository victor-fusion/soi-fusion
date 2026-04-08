import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPhases } from "@/lib/data/phases";
import type { Startup } from "@/types";
import { StartupsClient } from "./_components/StartupsClient";

const PER_PAGE = 15;

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string; page?: string }>;
}) {
  const { batch: batchParam, page: pageParam } = await searchParams;
  const supabase = await createClient();
  const phases = await getPhases();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const offset = (page - 1) * PER_PAGE;

  const { data: batchRows } = await supabase.from("startups").select("batch").order("batch");
  const availableBatches = [...new Set((batchRows ?? []).map((r: { batch: number }) => r.batch))].sort() as number[];

  const selectedBatch = batchParam !== undefined ? parseInt(batchParam, 10) : 0;
  const showAll = selectedBatch === 0;

  let countQuery = supabase.from("startups").select("*", { count: "exact", head: true });
  if (!showAll) countQuery = countQuery.eq("batch", selectedBatch);
  const { count: totalCount } = await countQuery;

  let query = supabase.from("startups").select("*").order("name").range(offset, offset + PER_PAGE - 1);
  if (!showAll) query = query.eq("batch", selectedBatch);
  const { data: startups } = await query;
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
    />
  );
}
