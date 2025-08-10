import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function QuickSnapshotBar({ alerts }: { alerts: string[] }) {
  if (!alerts?.length) return null;
  return (
    <Card className="glass-card border rounded-2xl p-3 md:p-4">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        <Sparkles className="shrink-0 text-[hsl(var(--accent-teal))]" />
        <div className="flex gap-2">
          {alerts.map((a, i) => (
            <Badge key={i} variant="secondary" className="whitespace-nowrap bg-[hsl(var(--brand)/.15)] text-foreground">
              {a}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
