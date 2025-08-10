import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DemandMonthCard({ peakLabel, series }: { peakLabel: string; series: { month: string; qty: number }[] }) {
  return (
    <Card className="glass-card border rounded-2xl">
      <CardHeader>
        <CardTitle className="font-display">Highest Demand Month</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground mb-2">Peak: <span className="text-foreground font-semibold">{peakLabel}</span></div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent-teal))" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="qty" fill="url(#barGradient)" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
