import { Link } from "@tanstack/react-router";
import { ChevronRight, FlaskConical, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "@/types";

export interface Crumb {
  label: string;
  to?: string;
}

export function PageHeader({ title, description, crumbs, actions }: { title: string; description?: string; crumbs?: Crumb[]; actions?: ReactNode }) {
  return (
    <div className="mb-6">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-1">
                {c.to ? (
                  <Link to={c.to} className="hover:text-foreground hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-foreground">
                    {c.label}
                  </span>
                )}
                {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Section({ title, description, actions, children, className }: { title?: string; description?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("surface p-5", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function SummaryCard({ label, value, icon: Icon, hint, tone = "primary" }: { label: string; value: number | string; icon: typeof Inbox; hint?: string; tone?: "primary" | "warning" | "success" | "teal" | "navy" }) {
  const toneCls = { primary: "bg-info-soft text-primary", warning: "bg-warning-soft text-warning", success: "bg-success-soft text-success", teal: "bg-teal/10 text-teal", navy: "bg-secondary text-navy" }[tone];
  return (
    <div className="surface flex items-start gap-3 p-4">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", toneCls)}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
      <Inbox className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function DemoNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">
      <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{children ?? "Data pada halaman ini adalah data ilustrasi untuk prototipe, bukan catatan operasional resmi."}</span>
    </div>
  );
}

export function InfoGrid({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs text-muted-foreground">{k}</dt>
          <dd className="text-sm font-medium text-foreground">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HistoryList({ items }: { items: HistoryEntry[] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">Belum ada riwayat proses.</p>;
  return (
    <ul className="space-y-3">
      {[...items].reverse().map((h, i) => (
        <li key={i} className="border-l-2 border-border pl-3">
          <p className="text-sm font-medium text-foreground">{h.action}</p>
          <p className="text-xs text-muted-foreground">
            {h.by} · {fmtDateTime(h.at)}
          </p>
          {h.note && <p className="mt-0.5 text-xs text-muted-foreground">“{h.note}”</p>}
        </li>
      ))}
    </ul>
  );
}

export function ConfirmButton({
  trigger,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  onConfirm,
  destructive,
}: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        Halaman {page} dari {pages}
      </span>
      <div className="flex gap-2">
        <button className="rounded-md border px-3 py-1.5 disabled:opacity-50" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Sebelumnya
        </button>
        <button className="rounded-md border px-3 py-1.5 disabled:opacity-50" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Berikutnya
        </button>
      </div>
    </div>
  );
}

export function BrandMark({ inverted }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-md border text-[10px] font-bold", inverted ? "border-navy-foreground/30 text-navy-foreground" : "border-navy/30 text-navy")} aria-label="Tempat logo instansi">
        LOGO
      </span>
      <span className="leading-tight">
        <span className={cn("block text-sm font-bold", inverted ? "text-navy-foreground" : "text-navy")}>Layanan KNK & PJKNK</span>
        <span className={cn("block text-[11px]", inverted ? "text-navy-foreground/70" : "text-muted-foreground")}>Sistem Layanan Terpadu 2026</span>
      </span>
    </span>
  );
}
