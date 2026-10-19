import { AlertTriangle, Check, X } from "lucide-react";
import { fmtDateTime } from "@/lib/format";
import { stagesFor } from "@/lib/workflow";
import { cn } from "@/lib/utils";
import type { Application } from "@/types";

const stateLabel = { done: "Selesai", current: "Tahap saat ini", upcoming: "Belum dimulai", attention: "Perlu tindakan", rejected: "Ditolak" };

export function ProgressTimeline({ app }: { app: Application }) {
  const stages = stagesFor(app);
  return (
    <ol className="relative space-y-0" aria-label="Progres pengajuan">
      {stages.map((s, i) => (
        <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
          {i < stages.length - 1 && (
            <span className={cn("absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-0.5", s.state === "done" ? "bg-success" : "bg-border")} aria-hidden />
          )}
          <span
            className={cn(
              "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
              s.state === "done" && "border-success bg-success text-primary-foreground",
              s.state === "current" && "border-primary bg-primary/10 text-primary",
              s.state === "upcoming" && "border-border bg-card text-muted-foreground",
              s.state === "attention" && "border-warning bg-warning-soft text-warning",
              s.state === "rejected" && "border-destructive bg-danger-soft text-destructive",
            )}
          >
            {s.state === "done" ? <Check className="h-3.5 w-3.5" /> : s.state === "attention" ? <AlertTriangle className="h-3.5 w-3.5" /> : s.state === "rejected" ? <X className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className={cn("text-sm font-medium", s.state === "upcoming" ? "text-muted-foreground" : "text-foreground")}>{s.label}</p>
            <p className="text-xs text-muted-foreground">
              {stateLabel[s.state]}
              {s.at && s.state !== "upcoming" ? ` · ${fmtDateTime(s.at)}` : ""}
            </p>
            {s.note && s.state !== "upcoming" && <p className="mt-0.5 text-xs text-muted-foreground">{s.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
