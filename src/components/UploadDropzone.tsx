import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { parseCSV, type SaleRecord } from "@/lib/csv";

const FACTS = [
  "Did you know? 80% of revenue comes from 20% of products.",
  "Tip: Spot seasonality by comparing month-over-month trends.",
  "Pro move: Use SKU prefixes to group product families.",
  "Insight: Price changes often show up in revenue before units.",
  "Fast fact: Peaks often follow campaigns by 1–2 weeks.",
];

export default function UploadDropzone({ onParsed }: { onParsed: (rows: SaleRecord[], fileName: string) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fact, setFact] = useState(FACTS[0]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!uploading) return;
    setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
    const id = setInterval(() => {
      setProgress((p) => (p < 92 ? p + 2 : p));
    }, 120);
    return () => clearInterval(id);
  }, [uploading]);

  const doParse = useCallback(async (file: File) => {
    setUploading(true);
    setFileName(file.name);
    try {
      const rows = await parseCSV(file);
      setProgress(100);
      setTimeout(() => setUploading(false), 400);
      onParsed(rows, file.name);
    } catch (e) {
      console.error(e);
      setUploading(false);
    }
  }, [onParsed]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) doParse(f);
  }, [doParse]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) doParse(f);
  }, [doParse]);

  const label = useMemo(() => uploading ? (progress < 100 ? "Uploading…" : "Parsed!") : "Drag & drop CSV or Upload", [uploading, progress]);

  return (
    <Card className="glass-card border rounded-2xl p-6 md:p-10">
      <CardContent className="p-0">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl p-10 md:p-14 text-center transition-colors ${dragActive ? "glow-ring" : "border-border"}`}
          aria-label="Upload CSV"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onChange}
          />
          <div className="flex items-center justify-center rounded-full p-4 bg-[hsl(var(--brand)/.15)]">
            {progress === 100 ? <CheckCircle2 className="text-[hsl(var(--accent-teal))]" /> : <UploadCloud />}
          </div>
          <div className="space-y-2">
            <p className="text-xl md:text-2xl font-display font-semibold">{label}</p>
            {fileName && <p className="text-sm text-muted-foreground">{fileName}</p>}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="hero"
              size="xl"
              onClick={() => inputRef.current?.click()}
            >
              Upload CSV
            </Button>
            <span className="text-xs text-muted-foreground hidden md:inline">or drop anywhere in the box</span>
          </div>

          {uploading && (
            <div className="w-full max-w-md mt-6">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">{fact}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
