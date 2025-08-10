import Papa from "papaparse";

export type SaleRecord = {
  date: string;
  product: string;
  qty: number;
  revenue: number;
};

export function parseCSV(file: File): Promise<SaleRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = (results.data as any[])
            .map((row) => {
              const date = String(
                row.date ?? row.Date ?? row.order_date ?? row.OrderDate ?? row.month ?? row.Month ?? ""
              );
              const product = String(
                row.product ?? row.Product ?? row.item ?? row.Item ?? row.sku ?? row.SKU ?? "Unknown"
              );
              const qty = Number(
                row.qty ?? row.quantity ?? row.Quantity ?? row.units ?? row.Units ?? 0
              ) || 0;
              const revenue = Number(
                row.revenue ?? row.sales ?? row.amount ?? row.total ?? row.Total ?? 0
              ) || 0;

              return { date, product, qty, revenue } as SaleRecord;
            })
            .filter((r) => r.product && (r.qty || r.revenue));
          resolve(rows);
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err),
    });
  });
}

export function formatCurrency(value: number, currency: string = "USD") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
}
