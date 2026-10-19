import { SLA_DAYS } from "@/constants/workflow";
import type { Application } from "@/types";

const dFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const dtFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export const fmtDate = (iso?: string) => (iso ? dFmt.format(new Date(iso)) : "—");
export const fmtDateTime = (iso?: string) => (iso ? `${dtFmt.format(new Date(iso))} WIB` : "—");
export const fmtSize = (b?: number) => (b == null ? "—" : b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

const STAFF_PENDING = ["diajukan", "pemeriksaan_dokumen", "diajukan_kembali", "pemeriksaan_lapangan", "menunggu_persetujuan", "penerbitan_skp", "finalisasi"];
export function isOverdue(app: Application, now = Date.now()) {
  return STAFF_PENDING.includes(app.status) && now - new Date(app.updatedAt).getTime() > SLA_DAYS * 86400000;
}
