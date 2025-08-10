import { SaleRecord } from "./csv";

function toMonthKey(input: string): string {
  if (!input) return "Unknown";
  const d = new Date(input);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  // try parse formats like 2024-05 or May 2024
  const m = input.match(/(\d{4})[-/ ]?(\d{1,2})/);
  if (m) return `${m[1]}-${String(Number(m[2])).padStart(2, "0")}`;
  return input;
}

export type Snapshot = {
  trendingProduct: { name: string; growthPct: number; total: number } | null;
  peakMonth: { label: string; totalQty: number } | null;
  revenueSeries: { month: string; revenue: number }[];
  quickAlerts: string[];
  totalsByProduct: Record<string, { qty: number; revenue: number }>;
};

export function analyzeSales(records: SaleRecord[]): Snapshot {
  const byProduct: Record<string, { qty: number; revenue: number; byMonth: Record<string, { qty: number; revenue: number }> }> = {};
  const byMonth: Record<string, { qty: number; revenue: number }> = {};

  for (const r of records) {
    const month = toMonthKey(r.date);
    if (!byProduct[r.product]) byProduct[r.product] = { qty: 0, revenue: 0, byMonth: {} };
    if (!byProduct[r.product].byMonth[month]) byProduct[r.product].byMonth[month] = { qty: 0, revenue: 0 };
    if (!byMonth[month]) byMonth[month] = { qty: 0, revenue: 0 };

    byProduct[r.product].qty += r.qty;
    byProduct[r.product].revenue += r.revenue;
    byProduct[r.product].byMonth[month].qty += r.qty;
    byProduct[r.product].byMonth[month].revenue += r.revenue;

    byMonth[month].qty += r.qty;
    byMonth[month].revenue += r.revenue;
  }

  const months = Object.keys(byMonth).filter(Boolean).sort();
  const revenueSeries = months.map((m) => ({ month: m, revenue: byMonth[m].revenue }));

  // Trending product by latest MoM qty growth
  let trending: Snapshot["trendingProduct"] = null;
  const last = months[months.length - 1];
  const prev = months[months.length - 2];
  if (last && prev) {
    for (const [name, stats] of Object.entries(byProduct)) {
      const l = stats.byMonth[last]?.qty ?? 0;
      const p = stats.byMonth[prev]?.qty ?? 0;
      if (l > 0) {
        const growth = p === 0 ? 100 : ((l - p) / Math.max(1, p)) * 100;
        if (!trending || growth > trending.growthPct) {
          trending = { name, growthPct: Math.round(growth), total: l };
        }
      }
    }
  }
  if (!trending) {
    // Fallback: top by qty
    const top = Object.entries(byProduct).sort((a, b) => b[1].qty - a[1].qty)[0];
    if (top) trending = { name: top[0], growthPct: 0, total: top[1].qty };
  }

  // Peak month by qty
  const peak = months
    .map((m) => ({ label: m, totalQty: byMonth[m].qty }))
    .sort((a, b) => b.totalQty - a.totalQty)[0] || null;

  const quickAlerts: string[] = [];
  if (trending) quickAlerts.push(`${trending.name} sales spiked ${trending.growthPct}%`);
  if (peak) quickAlerts.push(`Highest demand: ${peak.label}`);
  if (revenueSeries.length >= 2) {
    const diff = revenueSeries[revenueSeries.length - 1].revenue - revenueSeries[revenueSeries.length - 2].revenue;
    const pct = Math.round((diff / Math.max(1, revenueSeries[revenueSeries.length - 2].revenue)) * 100);
    quickAlerts.push(`Revenue ${pct >= 0 ? "up" : "down"} ${Math.abs(pct)}% MoM`);
  }

  const totalsByProduct = Object.fromEntries(
    Object.entries(byProduct).map(([k, v]) => [k, { qty: v.qty, revenue: v.revenue }])
  );

  return { trendingProduct: trending, peakMonth: peak, revenueSeries, quickAlerts, totalsByProduct };
}
