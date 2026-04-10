import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MiembrosClient } from "./_components/MiembrosClient";

const PER_PAGE = 15;

type MemberRow = {
  id: string;
  startup_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  role_title?: string;
  member_type: string | null;
  dedication: string | null;
  phone?: string;
  linkedin_url?: string;
  avatar_url?: string;
  startups: { id: string; name: string; batch: number } | { id: string; name: string; batch: number }[] | null;
};

export default async function MiembrosPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string; startup?: string; type?: string; page?: string }>;
}) {
  const { batch: batchParam, startup: startupParam, type: typeParam, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const offset = (page - 1) * PER_PAGE;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: batchRows } = await supabase.from("startups").select("batch").order("batch");
  const availableBatches = [
    ...new Set((batchRows ?? []).map((r: { batch: number }) => r.batch)),
  ].sort() as number[];
  const selectedBatch = batchParam !== undefined ? parseInt(batchParam, 10) : 0;
  const showAllBatches = selectedBatch === 0;

  let startupsQuery = supabase.from("startups").select("id, name, batch").order("name");
  if (!showAllBatches) startupsQuery = startupsQuery.eq("batch", selectedBatch);
  const { data: startupRows } = await startupsQuery;
  const allStartups = (startupRows ?? []) as { id: string; name: string; batch: number }[];
  const batchStartupIds = allStartups.map((s) => s.id);

  let countQuery = supabase.from("profiles").select("*", { count: "exact", head: true });
  if (startupParam) {
    countQuery = countQuery.eq("startup_id", startupParam);
  } else if (!showAllBatches && batchStartupIds.length > 0) {
    countQuery = countQuery.in("startup_id", batchStartupIds);
  }
  if (typeParam) countQuery = countQuery.eq("member_type", typeParam);
  const { count: totalCount } = await countQuery;
  const total = totalCount ?? 0;

  let query = supabase
    .from("profiles")
    .select("id, startup_id, first_name, last_name, email, role, role_title, member_type, dedication, phone, linkedin_url, avatar_url, startups(id, name, batch)")
    .order("first_name")
    .range(offset, offset + PER_PAGE - 1);

  if (startupParam) {
    query = query.eq("startup_id", startupParam);
  } else if (!showAllBatches && batchStartupIds.length > 0) {
    query = query.in("startup_id", batchStartupIds);
  }
  if (typeParam) query = query.eq("member_type", typeParam);

  const { data } = await query;
  const members = (data ?? []) as unknown as MemberRow[];

  return (
    <MiembrosClient
      members={members}
      allStartups={allStartups}
      availableBatches={availableBatches}
      selectedBatch={selectedBatch}
      startupParam={startupParam ?? ""}
      typeParam={typeParam ?? ""}
      total={total}
      page={page}
    />
  );
}
