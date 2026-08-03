/**
 * ============================================
 * KRIOU DOCS — Métricas do Painel Admin
 * ============================================
 * Módulo compartilhado de cálculo de métricas,
 * consumido pelo edge function "admin-metrics"
 * (equivalente a lib/admin/metrics.ts).
 *
 * Fontes de dados (Supabase, via service_role):
 * - profiles              → total de usuários e novos usuários no período
 * - documents             → receita aprovada, total de documentos e
 *                           séries temporais (diária/mensal)
 * - credit_transactions   → consumo de créditos (opcional: enquanto a
 *                           tabela não existir, retorna zeros)
 *
 * Períodos suportados: "7d" | "30d" | "90d" | "1y" | "all".
 * ============================================
 */

import { createAdminClient } from "./auth.ts";

export type MetricsPeriod = "7d" | "30d" | "90d" | "1y" | "all";

export const METRICS_PERIODS: readonly MetricsPeriod[] = ["7d", "30d", "90d", "1y", "all"];

const PERIOD_DAYS: Record<Exclude<MetricsPeriod, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

/** Status de pagamento considerados "aprovados" (APROVADO / APPROVED). */
const APPROVED_PAYMENT_STATUSES = new Set(["approved", "aprovado"]);

/** Status de pagamento considerados pendentes (aguardando confirmação). */
const PENDING_PAYMENT_STATUSES = new Set([
  "pending",
  "in_process",
  "in_mediation",
  "authorized",
]);

/** Status de pagamento considerados recusados/falhos. */
const FAILED_PAYMENT_STATUSES = new Set([
  "rejected",
  "cancelled",
  "refunded",
  "charged_back",
]);

export function isApprovedPaymentStatus(status: string | null | undefined): boolean {
  return Boolean(status) && APPROVED_PAYMENT_STATUSES.has(String(status).toLowerCase());
}

export function isPendingPaymentStatus(status: string | null | undefined): boolean {
  return Boolean(status) && PENDING_PAYMENT_STATUSES.has(String(status).toLowerCase());
}

export function isFailedPaymentStatus(status: string | null | undefined): boolean {
  return Boolean(status) && FAILED_PAYMENT_STATUSES.has(String(status).toLowerCase());
}

export function isMetricsPeriod(value: string): value is MetricsPeriod {
  return (METRICS_PERIODS as readonly string[]).includes(value);
}

// ─── Período ─────────────────────────────────────────────────────────────────

export interface PeriodRange {
  /** null indica "desde sempre" (período "all"). */
  start: Date | null;
  end: Date;
}

export function getPeriodRange(period: MetricsPeriod, now: Date = new Date()): PeriodRange {
  const end = now;
  if (period === "all") return { start: null, end };
  const start = new Date(now);
  start.setDate(start.getDate() - PERIOD_DAYS[period]);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

type Granularity = "day" | "month";

/** "7d", "30d" e "90d" → diário; "1y" e "all" → mensal. */
export function chooseGranularity(period: MetricsPeriod): Granularity {
  return period === "1y" || period === "all" ? "month" : "day";
}

// ─── Utilitários de tempo (UTC, sem ambiguidade de fuso) ────────────────────

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function startOfMonthUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function addDaysUTC(d: Date, days: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days));
}

function addMonthsUTC(d: Date, months: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
}

function toBucketKey(d: Date, granularity: Granularity): string {
  const year = String(d.getUTCFullYear()).padStart(4, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  if (granularity === "month") return `${year}-${month}`;
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function bucketLabel(key: string, granularity: Granularity): string {
  const [year, month, day] = key.split("-");
  if (granularity === "month") return `${month}/${year}`;
  return `${day}/${month}`;
}

function earliestDate(dates: Date[]): Date | null {
  if (dates.length === 0) return null;
  return dates.reduce((min, d) => (d < min ? d : min));
}

// ─── Séries temporais ────────────────────────────────────────────────────────

export interface SeriesPoint {
  key: string;
  label: string;
  value: number;
}

function buildSeries(
  start: Date,
  end: Date,
  points: { date: Date; value: number }[],
  granularity: Granularity,
): SeriesPoint[] {
  const buckets = new Map<string, SeriesPoint>();
  let cursor = granularity === "month" ? startOfMonthUTC(start) : startOfDayUTC(start);
  const endKey = toBucketKey(end, granularity);
  let guard = 0;

  while (toBucketKey(cursor, granularity) <= endKey && guard < 2000) {
    const key = toBucketKey(cursor, granularity);
    buckets.set(key, { key, label: bucketLabel(key, granularity), value: 0 });
    cursor = granularity === "month" ? addMonthsUTC(cursor, 1) : addDaysUTC(cursor, 1);
    guard += 1;
  }

  for (const point of points) {
    const bucket = buckets.get(toBucketKey(point.date, granularity));
    if (bucket) bucket.value += point.value;
  }

  return Array.from(buckets.values());
}

// ─── Consumo de créditos (CreditTransaction) ─────────────────────────────────

interface CreditUsage {
  /** false enquanto a tabela credit_transactions não existir. */
  available: boolean;
  total: number;
  inPeriod: number;
}

async function computeCreditUsage(
  supabase: ReturnType<typeof createAdminClient>,
  start: Date | null,
  end: Date,
): Promise<CreditUsage> {
  const result: CreditUsage = { available: false, total: 0, inPeriod: 0 };

  try {
    const { data, error } = await supabase
      .from("credit_transactions")
      .select("amount, created_at");

    if (error) throw error;
    if (!Array.isArray(data)) return result;

    result.available = true;
    for (const tx of data) {
      const amount = Number(tx.amount) || 0;
      result.total += amount;
      const ts = tx.created_at ? new Date(tx.created_at) : null;
      if (ts && start && ts >= start && ts <= end) result.inPeriod += amount;
    }
    if (!start) result.inPeriod = result.total;
  } catch (err) {
    // Tabela de créditos ainda não existe no banco — mantém zeros.
    console.warn(
      "[metrics] credit_transactions indisponível:",
      err instanceof Error ? err.message : err,
    );
  }

  return result;
}

// ─── Cálculo principal ───────────────────────────────────────────────────────

export interface MetricsResult {
  period: MetricsPeriod;
  generatedAt: string;
  range: { start: string | null; end: string };
  summary: {
    /** Receita total aprovada (soma de pagamentos APROVADO/APPROVED), histórico completo. */
    totalApprovedRevenue: number;
    /** Receita aprovada dentro do período solicitado. */
    revenueInPeriod: number;
    /** Total de usuários cadastrados. */
    totalUsers: number;
    /** Novos usuários no período (para "all", igual a totalUsers). */
    newUsers: number;
    /** Total de documentos gerados. */
    totalDocuments: number;
    /** Documentos gerados no período (para "all", igual a totalDocuments). */
    newDocuments: number;
    /** Pagamentos aprovados dentro do período (funil financeiro). */
    approvedPayments: number;
    /** Pagamentos pendentes dentro do período. */
    pendingPayments: number;
    /** Pagamentos recusados/falhos dentro do período. */
    failedPayments: number;
    creditUsage: CreditUsage;
  };
  series: {
    revenue: SeriesPoint[];
    documents: SeriesPoint[];
  };
  /** Falhas recentes de processamento (webhook / pagamento) que exigem ação. */
  recentFailures: Array<{
    id: string;
    provider: string | null;
    action: string | null;
    payment_id: string | null;
    error_code: string | null;
    processing_status: string | null;
    received_at: string | null;
  }>;
}

type RecentFailure = MetricsResult["recentFailures"][number];

async function computeRecentFailures(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<RecentFailure[]> {
  try {
    const { data, error } = await supabase
      .from("payment_webhook_events")
      .select("event_key, provider, action, payment_id, error_code, processing_status, received_at")
      .not("error_code", "is", null)
      .order("received_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    return (data || []).map((failure) => ({
      ...failure,
      id: failure.event_key,
    }));
  } catch (err) {
    // A trilha financeira é complementar às métricas principais. Uma migration
    // ainda não aplicada não deve zerar usuários, documentos e receita.
    console.warn(
      "[metrics] payment_webhook_events indisponível:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

export async function calculateMetrics(
  supabase: ReturnType<typeof createAdminClient>,
  period: MetricsPeriod,
): Promise<MetricsResult> {
  const now = new Date();
  const { start, end } = getPeriodRange(period, now);
  const startIso = start ? start.toISOString() : null;
  const granularity = chooseGranularity(period);

  // ── Usuários ──
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  let newUsers = totalUsers ?? 0;
  if (startIso) {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startIso);
    newUsers = count ?? 0;
  }

  // ── Documentos: contagens + dados para séries/receita ──
  const { count: totalDocuments } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  let newDocuments = totalDocuments ?? 0;
  if (startIso) {
    const { count } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startIso);
    newDocuments = count ?? 0;
  }

  // Nota: busca apenas as colunas relevantes; padrão já usado em admin/index.ts.
  const { data: docs, error: docsError } = await supabase
    .from("documents")
    .select("created_at, payment_status, payment_amount, paid_at");

  if (docsError) throw docsError;

  const documentPoints: { date: Date; value: number }[] = [];
  const revenuePoints: { date: Date; value: number }[] = [];

  let totalApprovedRevenue = 0;
  let inPeriodRevenue = 0;
  let approvedInPeriod = 0;
  let pendingInPeriod = 0;
  let failedInPeriod = 0;

  for (const doc of docs || []) {
    const createdAt = doc.created_at ? new Date(doc.created_at) : null;
    const inPeriod = start ? Boolean(createdAt && createdAt >= start && createdAt <= end) : true;
    if (createdAt) documentPoints.push({ date: createdAt, value: 1 });

    if (isApprovedPaymentStatus(doc.payment_status)) {
      const amount = Number(doc.payment_amount) || 0;
      totalApprovedRevenue += amount;
      const ts = doc.paid_at ? new Date(doc.paid_at) : createdAt;
      if (ts) {
        revenuePoints.push({ date: ts, value: amount });
        if (start && ts >= start && ts <= end) {
          inPeriodRevenue += amount;
          approvedInPeriod += 1;
        } else if (!start) {
          approvedInPeriod += 1;
        }
      }
    } else if (inPeriod) {
      if (isPendingPaymentStatus(doc.payment_status)) {
        pendingInPeriod += 1;
      } else if (isFailedPaymentStatus(doc.payment_status)) {
        failedInPeriod += 1;
      }
    }
  }

  const revenueInPeriod = start ? inPeriodRevenue : totalApprovedRevenue;

  // ── Séries temporais ──
  const firstDate = earliestDate([...revenuePoints.map((p) => p.date), ...documentPoints.map((p) => p.date)]);
  const seriesStart = start ?? firstDate ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const revenueSeries = buildSeries(seriesStart, end, revenuePoints, granularity);
  const documentsSeries = buildSeries(seriesStart, end, documentPoints, granularity);

  // ── Consumo de créditos ──
  const creditUsage = await computeCreditUsage(supabase, start, end);

  // ── Falhas recentes que exigem ação (webhook / pagamento) ──
  // Atenção: a PK da tabela é `event_key`, não `id`. Selecionamos `event_key`
  // e reexpomos como `id` para manter o contrato do frontend estável.
  const recentFailures = await computeRecentFailures(supabase);

  return {
    period,
    generatedAt: now.toISOString(),
    range: { start: startIso, end: end.toISOString() },
    summary: {
      totalApprovedRevenue: roundMoney(totalApprovedRevenue),
      revenueInPeriod: roundMoney(revenueInPeriod),
      totalUsers: totalUsers ?? 0,
      newUsers,
      totalDocuments: totalDocuments ?? 0,
      newDocuments,
      approvedPayments: approvedInPeriod,
      pendingPayments: pendingInPeriod,
      failedPayments: failedInPeriod,
      creditUsage,
    },
    series: {
      revenue: revenueSeries.map((point) => ({ ...point, value: roundMoney(point.value) })),
      documents: documentsSeries,
    },
    recentFailures: recentFailures || [],
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
