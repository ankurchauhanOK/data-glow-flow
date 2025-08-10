import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";

export default function TrendingProductCard({ name, growthPct, onCopy }: { name: string; growthPct: number; onCopy: () => void }) {
  useEffect(() => {
    if (!name) return;
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.2 },
      colors: ["#00F5D4", "#7C3AED", "#FBCFE8"],
      disableForReducedMotion: true,
    });
  }, [name, growthPct]);

  const insight = `${name} is trending with ${growthPct}% growth!`;

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: insight, title: "Trending Product" }); } catch {}
    } else {
      await navigator.clipboard.writeText(insight);
    }
  };

  return (
    <Card className="glass-card border rounded-2xl">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-display">Trending Product</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" aria-label="Copy insight" onClick={onCopy}><Copy /></Button>
          <Button variant="ghost" size="icon" aria-label="Share insight" onClick={share}><Share2 /></Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🛍️</div>
          <div>
            <div className="text-2xl md:text-3xl font-bold font-display">{name}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Up <span className="text-[hsl(var(--accent-teal))] font-semibold">{growthPct}%</span> vs last month
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
