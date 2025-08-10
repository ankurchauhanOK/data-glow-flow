import { useEffect, useMemo, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import UploadDropzone from "@/components/UploadDropzone";
import QuickSnapshotBar from "@/components/QuickSnapshotBar";
import TrendingProductCard from "@/components/cards/TrendingProductCard";
import DemandMonthCard from "@/components/cards/DemandMonthCard";
import RevenueOverviewCard from "@/components/cards/RevenueOverviewCard";
import FullSalesTable from "@/components/FullSalesTable";
import { analyzeSales, type Snapshot } from "@/lib/analyzer";
import { parseCSV, type SaleRecord } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const Index = () => {
  const [rows, setRows] = useState<SaleRecord[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const insightsRef = useRef<HTMLDivElement | null>(null);
  const fabInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    document.title = "Smart E‑Commerce Trend Analyzer | Turn Data Into Trends";
  }, []);

  const onParsed = (data: SaleRecord[], fName: string) => {
    setRows(data);
    setFileName(fName);
    const snap = analyzeSales(data);
    setSnapshot(snap);
    setTimeout(() => insightsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "u") fabInputRef.current?.click();
      if (e.key.toLowerCase() === "g") insightsRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const qtySeries = useMemo(() => {
    if (!rows || !snapshot) return [] as { month: string; qty: number }[];
    const months = snapshot.revenueSeries.map((s) => s.month).sort();
    const toMonthKey = (input: string) => {
      const d = new Date(input);
      if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const m = input.match(/(\d{4})[-/ ]?(\d{1,2})/);
      if (m) return `${m[1]}-${String(Number(m[2])).padStart(2, "0")}`;
      return input;
    };
    return months.map((m) => ({ month: m, qty: rows.filter(r => toMonthKey(r.date) === m).reduce((a, b) => a + b.qty, 0) }));
  }, [rows, snapshot]);

  return (
    <div className="min-h-screen app-gradient font-body">
      <header className="container mx-auto flex items-center justify-between py-6">
        <div className="text-lg font-display font-semibold tracking-wide">Data Meets Dopamine</div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6">
        <section className="text-center py-6 md:py-12">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Turn Data Into Trends. Instantly.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Your data, decoded in seconds. See what’s hot—right now! Upload a CSV and get live insights with zero extra clicks.
          </p>
          <div className="max-w-3xl mx-auto">
            <UploadDropzone onParsed={onParsed} />
          </div>
        </section>

        {snapshot && (
          <section ref={insightsRef} className="space-y-6 animate-enter">
            <QuickSnapshotBar alerts={snapshot.quickAlerts} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {snapshot.trendingProduct && (
                <TrendingProductCard
                  name={snapshot.trendingProduct.name}
                  growthPct={snapshot.trendingProduct.growthPct}
                  onCopy={async () => navigator.clipboard.writeText(`${snapshot.trendingProduct?.name} spiked ${snapshot.trendingProduct?.growthPct}%!`)}
                />
              )}
              <DemandMonthCard
                peakLabel={snapshot.peakMonth?.label ?? "—"}
                series={qtySeries}
              />
              <RevenueOverviewCard series={snapshot.revenueSeries} />
            </div>

            {rows && <FullSalesTable rows={rows} />}
          </section>
        )}
      </main>

      <input ref={fabInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0];
        if (f) {
          const data = await parseCSV(f);
          onParsed(data, f.name);
        }
      }} />
      <Button
        variant="fab"
        size="fab"
        className="fixed bottom-6 right-6 hover-scale"
        aria-label="Upload New Data"
        onClick={() => fabInputRef.current?.click()}
      >
        <Upload />
      </Button>
    </div>
  );
};

export default Index;
