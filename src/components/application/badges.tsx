import { CheckCircle2, Circle, AlertTriangle, XCircle, Info } from "lucide-react";
import { DOC_STATUS_META, SKP_STATUS_META, STATUS_META, type Tone } from "@/constants/workflow";
import { cn } from "@/lib/utils";
import type { AppStatus, DocReviewStatus, SkpStatus } from "@/types";

const toneClass: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-info-soft text-info border-info/20",
  warning: "bg-warning-soft text-warning border-warning/25",
  success: "bg-success-soft text-success border-success/25",
  danger: "bg-danger-soft text-destructive border-destructive/25",
};
const toneIcon: Record<Tone, typeof Circle> = {
  neutral: Circle,
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  danger: XCircle,
};

export function ToneBadge({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  const Icon = toneIcon[tone];
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium", toneClass[tone], className)}>
      <Icon className="h-3 w-3" aria-hidden />
      {children}
    </span>
  );
}

export const StatusBadge = ({ status }: { status: AppStatus }) => <ToneBadge tone={STATUS_META[status].tone}>{STATUS_META[status].label}</ToneBadge>;
export const DocStatusBadge = ({ status }: { status: DocReviewStatus }) => <ToneBadge tone={DOC_STATUS_META[status].tone}>{DOC_STATUS_META[status].label}</ToneBadge>;
export const SkpStatusBadge = ({ status }: { status: SkpStatus }) => <ToneBadge tone={SKP_STATUS_META[status].tone}>{SKP_STATUS_META[status].label}</ToneBadge>;
