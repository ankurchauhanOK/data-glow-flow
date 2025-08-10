import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Pause, Play, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

export default function RevenueOverviewCard({ series }: { series: { month: string; revenue: number }[] }) {
  const [playing, setPlaying] = useState(true);
  const change = useMemo(() => {
    if (series.length < 2) return 0;
    const prev = series[series.length - 2].revenue;
    const curr = series[series.length - 1].revenue;
    return Math.round(((curr - prev) / Math.max(1, prev)) * 100);
  }, [series]);

  return (
    <Card className="glass-card border rounded-2xl">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-display">Revenue Overview</CardTitle>
        <Button size="icon" variant="ghost" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause /> : <Play />}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-2 text-sm">
          {change >= 0 ? <TrendingUp className="text-[hsl(var(--accent-teal))]" /> : <TrendingDown className="text-destructive" />}
          <span className={change >= 0 ? "text-[hsl(var(--accent-teal))]" : "text-destructive"}>{change >= 0 ? "+" : ""}{change}%</span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
        <div className="relative h-48">
          {playing && <div className="absolute inset-x-0 top-0 h-1 bg-[hsl(var(--accent-teal)/.4)] animate-[slide-in-right_2s_ease-in-out_infinite]" />}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent-teal))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
