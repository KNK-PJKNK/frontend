// Mock service layer. Mirrors the intended API: every mutation goes through a
// workflow rule (role + stage checks). Persists to localStorage for the demo
// session only — replace with backend calls for production.
import { useSyncExternalStore } from "react";
import * as wf from "@/lib/workflow";
import type { Application, ApplicantInfo, Notification, Organization, RequestType, ServiceType, User } from "@/types";
import { DEMO_PASSWORD, DEMO_USERS, SEED_APPLICATIONS, SEED_NOTIFICATIONS } from "./mock-data";

interface DB {
  applications: Application[];
  notifications: Notification[];
  sessionUserId: string | null;
}

const KEY = "knk-pjknk-demo-v1";
const SEED: DB = { applications: SEED_APPLICATIONS, notifications: SEED_NOTIFICATIONS, sessionUserId: null };

function load(): DB {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...SEED, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return SEED;
}

let db: DB = load();
const listeners = new Set<() => void>();

function commit(next: DB) {
  db = next;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(db));
  listeners.forEach((l) => l());
}

export function useDB(): DB {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => db,
    () => SEED,
  );
}

// ---------- Auth (demo) ----------

export function getSessionUser(): User | null {
  return DEMO_USERS.find((u) => u.id === db.sessionUserId) ?? null;
}
export function useSessionUser(): User | null {
  const d = useDB();
  return DEMO_USERS.find((u) => u.id === d.sessionUserId) ?? null;
}
export async function login(email: string, password: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 500));
  const user = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || password !== DEMO_PASSWORD) throw new Error("Email atau kata sandi tidak sesuai.");
  commit({ ...db, sessionUserId: user.id });
  return user;
}
export function logout() {
  commit({ ...db, sessionUserId: null });
}
export function homeFor(user: User) {
  void user;
  return "/" as const;
}

export function resetDemo() {
  commit({ ...SEED, sessionUserId: db.sessionUserId });
}

// ---------- Mutations ----------

export type Result = { ok: true; app: Application } | { ok: false; error: string };

const notifyText: Partial<Record<Application["status"], string>> = {
  pemeriksaan_dokumen: "sedang diperiksa tim kerja.",
  perlu_perbaikan: "memerlukan perbaikan. Silakan cek catatan reviewer.",
  pemeriksaan_lapangan: "diteruskan ke pemeriksaan lapangan.",
  menunggu_persetujuan: "menunggu persetujuan pejabat berwenang.",
  penerbitan_skp: "telah disetujui dan masuk proses penerbitan SKP.",
  finalisasi: "dalam tahap finalisasi dokumen.",
  selesai: "telah selesai. Dokumen SKP dapat diunduh.",
  ditolak: "tidak dapat dilanjutkan (ditolak).",
};

function mutate(id: string, fn: (app: Application, actor: User) => Application): Result {
  const actor = getSessionUser();
  if (!actor) return { ok: false, error: "Sesi berakhir. Silakan masuk kembali." };
  const app = db.applications.find((a) => a.id === id);
  if (!app) return { ok: false, error: "Pengajuan tidak ditemukan." };
  try {
    const next = fn(app, actor);
    let notifications = db.notifications;
    if (next.status !== app.status && actor.id !== next.ownerId && notifyText[next.status]) {
      notifications = [
        { id: `n-${Date.now()}`, userId: next.ownerId, at: next.updatedAt, text: `Pengajuan ${next.id} ${notifyText[next.status]}`, appId: next.id, read: false },
        ...notifications,
      ];
    }
    commit({ ...db, applications: db.applications.map((a) => (a.id === id ? next : a)), notifications });
    return { ok: true, app: next };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

export interface DraftInput {
  id?: string;
  service: ServiceType;
  requestType: RequestType;
  applicant: ApplicantInfo;
  organization: Organization;
  files: Record<string, { name: string; size: number } | undefined>;
}

export function saveDraft(input: DraftInput): Result {
  const actor = getSessionUser();
  if (!actor || actor.role !== "pemohon") return { ok: false, error: "Hanya pemohon yang dapat membuat pengajuan." };
  const at = new Date().toISOString();
  let app = input.id ? db.applications.find((a) => a.id === input.id && a.ownerId === actor.id) : undefined;
  if (app && app.status !== "draft") return { ok: false, error: "Pengajuan sudah dikirim dan tidak dapat diubah." };
  const docs = wf.buildDocuments(input.service, input.requestType).map((d) => {
    const f = input.files[d.key];
    return f ? { ...d, fileName: f.name, fileSize: f.size, uploadedAt: at, version: 1 } : d;
  });
  if (!app) {
    const n = db.applications.filter((a) => a.service === input.service).length + 1 + Math.floor(Math.random() * 50) + 20;
    const id = `${input.service}-2026-${String(n).padStart(4, "0")}`;
    app = { id, ownerId: actor.id, service: input.service, requestType: input.requestType, status: "draft", createdAt: at, updatedAt: at, applicant: input.applicant, organization: input.organization, documents: docs, revisions: [], history: [] };
    commit({ ...db, applications: [app, ...db.applications] });
  } else {
    app = { ...app, service: input.service, requestType: input.requestType, applicant: input.applicant, organization: input.organization, documents: docs, updatedAt: at };
    const saved = app;
    commit({ ...db, applications: db.applications.map((a) => (a.id === saved.id ? saved : a)) });
  }
  return { ok: true, app };
}

export const api = {
  submit: (id: string) => mutate(id, (a, u) => wf.submitApplication(a, u)),
  startReview: (id: string) => mutate(id, (a, u) => wf.startReview(a, u)),
  reviewDocument: (id: string, key: string, status: "diterima" | "perlu_perbaikan", note: string) =>
    mutate(id, (a, u) => wf.reviewDocument(a, u, key, status, note)),
  returnForRevision: (id: string, note: string) => mutate(id, (a, u) => wf.returnForRevision(a, u, note)),
  forward: (id: string) => mutate(id, (a, u) => wf.forwardAfterVerification(a, u)),
  scheduleField: (id: string, input: Parameters<typeof wf.scheduleField>[2]) => mutate(id, (a, u) => wf.scheduleField(a, u, input)),
  recordField: (id: string, input: Parameters<typeof wf.recordFieldResult>[2]) => mutate(id, (a, u) => wf.recordFieldResult(a, u, input)),
  replaceDocument: (id: string, key: string, file: { name: string; size: number }) => mutate(id, (a, u) => wf.replaceRevisionDocument(a, u, key, file)),
  updateContact: (id: string, c: { telepon: string; email: string }) => mutate(id, (a, u) => wf.updateContact(a, u, c)),
  resubmit: (id: string, response: string) => mutate(id, (a, u) => wf.resubmit(a, u, response)),
  decide: (id: string, d: "setuju" | "kembalikan" | "tolak", comment: string, docKeys: string[]) => mutate(id, (a, u) => wf.decide(a, u, d, comment, docKeys)),
  assignSkp: (id: string, nomor: string) => {
    if (db.applications.some((a) => a.skp?.nomor?.toLowerCase() === nomor.trim().toLowerCase()))
      return { ok: false, error: "Nomor SKP sudah digunakan." } as Result;
    return mutate(id, (a, u) => wf.assignSkpNumber(a, u, nomor));
  },
  sendToSignature: (id: string) => mutate(id, (a, u) => wf.sendToSignature(a, u)),
  recordSignature: (id: string, success: boolean, note: string) => mutate(id, (a, u) => wf.recordSignatureResult(a, u, success, note)),
  deliver: (id: string, input: { metode: string; catatan: string }) => mutate(id, (a, u) => wf.recordDelivery(a, u, input)),
  markNotificationsRead: () => {
    const u = getSessionUser();
    if (!u) return;
    commit({ ...db, notifications: db.notifications.map((n) => (n.userId === u.id ? { ...n, read: true } : n)) });
  },
};

/** Public SKP lookup — returns only fields approved for public access. */
export async function searchPublicSkp(nomor: string) {
  await new Promise((r) => setTimeout(r, 600));
  const app = db.applications.find((a) => a.skp?.status === "tte_berhasil" && a.skp.nomor?.toLowerCase() === nomor.trim().toLowerCase());
  if (!app || !app.skp) return null;
  return {
    nomor: app.skp.nomor!,
    layanan: app.service,
    jenis: app.requestType,
    instansi: app.organization.nama,
    provinsi: app.organization.provinsi,
    terbit: app.skp.tteAt!,
    berlakuSampai: app.skp.berlakuSampai!,
    berlaku: new Date(app.skp.berlakuSampai!).getTime() > Date.now(),
  };
}
