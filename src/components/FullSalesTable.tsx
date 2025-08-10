import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SaleRecord } from "@/lib/csv";

export default function FullSalesTable({ rows }: { rows: SaleRecord[] }) {
  const [sort, setSort] = useState<{ key: keyof SaleRecord; dir: 1 | -1 }>({ key: "revenue", dir: -1 });

  const sorted = useMemo(() => {
    const list = [...rows];
    list.sort((a, b) => (a[sort.key] as number) - (b[sort.key] as number));
    return sort.dir === -1 ? list.reverse() : list;
  }, [rows, sort]);

  const toggleSort = (key: keyof SaleRecord) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));

  const topRevenue = new Set(sorted.slice(0, 3).map((r) => r.product));

  return (
    <Card className="glass-card border rounded-2xl">
      <CardHeader>
        <CardTitle className="font-display">Full Sales Table</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="max-h-[60vh] overflow-auto overscroll-contain touch-pan-y">
          <Table>
            <TableHeader className="sticky top-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TableRow>
                <TableHead role="button" tabIndex={0} onClick={() => toggleSort("date")} onKeyDown={(e) => e.key === 'Enter' && toggleSort("date")}>Date</TableHead>
                <TableHead role="button" tabIndex={0} onClick={() => toggleSort("product")} onKeyDown={(e) => e.key === 'Enter' && toggleSort("product")}>Product</TableHead>
                <TableHead role="button" tabIndex={0} onClick={() => toggleSort("qty")} onKeyDown={(e) => e.key === 'Enter' && toggleSort("qty")} className="text-right">Qty</TableHead>
                <TableHead role="button" tabIndex={0} onClick={() => toggleSort("revenue")} onKeyDown={(e) => e.key === 'Enter' && toggleSort("revenue")} className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r, i) => (
                <TableRow key={i} className={topRevenue.has(r.product) ? "bg-[hsl(var(--brand)/.08)]" : undefined}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell className="font-medium">{r.product}</TableCell>
                  <TableCell className="text-right">{r.qty}</TableCell>
                  <TableCell className="text-right">{r.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
