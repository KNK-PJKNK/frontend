// Pure workflow transitions. In production these rules must also run on the backend;
// here they act as the mock service's authoritative checks.
import { DOC_REQUIREMENTS, STAGE_LABEL } from "@/constants/workflow";
import type {
  AppStatus,
  Application,
  ApplicationDocument,
  ApprovalDecision,
  FieldExamination,
  RequestType,
  Role,
  ServiceType,
  StageKey,
  User,
} from "@/types";

export class WorkflowError extends Error {}

const iso = () => new Date().toISOString();

function assertRole(actor: User, roles: Role[]) {
  if (!roles.includes(actor.role)) throw new WorkflowError("Anda tidak memiliki izin untuk tindakan ini.");
}
function assertStatus(app: Application, statuses: AppStatus[]) {
  if (!statuses.includes(app.status))
    throw new WorkflowError("Tindakan tidak tersedia pada tahap pengajuan saat ini.");
}
function assertOwner(app: Application, actor: User) {
  if (actor.role !== "pemohon" || app.ownerId !== actor.id)
    throw new WorkflowError("Hanya pemohon pemilik pengajuan yang dapat melakukan tindakan ini.");
}
function log(app: Application, actor: User, action: string, stage: StageKey, at: string, note?: string): Application {
  return { ...app, updatedAt: at, history: [...app.history, { at, by: actor.name, action, stage, note }] };
}

export function buildDocuments(service: ServiceType, requestType: RequestType): ApplicationDocument[] {
  return DOC_REQUIREMENTS[service][requestType].map((r) => ({ ...r, version: 0, status: "belum_diperiksa" }));
}

export function missingRequiredDocs(app: Application) {
  return app.documents.filter((d) => d.required && !d.fileName);
}

export function uploadDraftDocument(app: Application, actor: User, key: string, file: { name: string; size: number }, at = iso()) {
  assertOwner(app, actor);
  assertStatus(app, ["draft"]);
  return {
    ...app,
    updatedAt: at,
    documents: app.documents.map((d) =>
      d.key === key ? { ...d, fileName: file.name, fileSize: file.size, uploadedAt: at, version: d.version + 1 } : d,
    ),
  };
}

export function submitApplication(app: Application, actor: User, at = iso()) {
  assertOwner(app, actor);
  assertStatus(app, ["draft"]);
  if (missingRequiredDocs(app).length) throw new WorkflowError("Masih ada dokumen wajib yang belum diunggah.");
  return log({ ...app, status: "diajukan", submittedAt: at }, actor, "Pengajuan dikirim oleh pemohon", "diajukan", at);
}

export function startReview(app: Application, actor: User, at = iso()) {
  assertRole(actor, ["petugas"]);
  assertStatus(app, ["diajukan", "diajukan_kembali"]);
  return log({ ...app, status: "pemeriksaan_dokumen", assignee: actor.name }, actor, "Pemeriksaan dokumen dimulai", "pemeriksaan_dokumen", at);
}

export function reviewDocument(app: Application, actor: User, key: string, status: "diterima" | "perlu_perbaikan", note: string, at = iso()) {
  assertRole(actor, ["petugas"]);
  assertStatus(app, ["pemeriksaan_dokumen"]);
  if (status === "perlu_perbaikan" && !note.trim()) throw new WorkflowError("Catatan perbaikan wajib diisi.");
  return {
    ...app,
    updatedAt: at,
    documents: app.documents.map((d) => (d.key === key ? { ...d, status, note: note.trim() || undefined } : d)),
  };
}

export function returnForRevision(app: Application, actor: User, note: string, at = iso()) {
  assertRole(actor, ["petugas"]);
  assertStatus(app, ["pemeriksaan_dokumen"]);
  const items = app.documents.filter((d) => d.status === "perlu_perbaikan").map((d) => d.key);
  if (!items.length) throw new WorkflowError("Tandai minimal satu dokumen yang perlu diperbaiki.");
  if (!note.trim()) throw new WorkflowError("Catatan umum perbaikan wajib diisi.");
  return log(
    {
      ...app,
      status: "perlu_perbaikan",
      revisions: [...app.revisions, { id: `rev-${at}`, createdAt: at, by: actor.name, source: "verifikasi", note, items }],
    },
    actor,
    "Pengajuan dikembalikan untuk perbaikan",
    "perbaikan",
    at,
    note,
  );
}

export function forwardAfterVerification(app: Application, actor: User, at = iso()) {
  assertRole(actor, ["petugas"]);
  assertStatus(app, ["pemeriksaan_dokumen"]);
  const pending = app.documents.filter((d) => d.fileName && d.status !== "diterima");
  const missing = missingRequiredDocs(app);
  if (pending.length || missing.length) throw new WorkflowError("Semua dokumen harus berstatus Diterima sebelum diteruskan.");
  if (app.service === "PJKNK") {
    return log(
      { ...app, status: "pemeriksaan_lapangan", field: { status: "belum_dijadwalkan", bukti: [] } },
      actor,
      "Dokumen lengkap, diteruskan ke pemeriksaan lapangan",
      "lapangan",
      at,
    );
  }
  return log({ ...app, status: "menunggu_persetujuan" }, actor, "Dokumen lengkap, diteruskan ke pejabat", "persetujuan", at);
}

export function scheduleField(app: Application, actor: User, input: { jadwal: string; lokasi: string; petugas: string }, at = iso()) {
  assertRole(actor, ["petugas"]);
  assertStatus(app, ["pemeriksaan_lapangan"]);
  if (!input.jadwal || !input.petugas.trim()) throw new WorkflowError("Jadwal dan petugas pemeriksa wajib diisi.");
  const field: FieldExamination = { ...(app.field ?? { bukti: [] }), ...input, status: "dijadwalkan", updatedAt: at };
  return log({ ...app, field }, actor, "Pemeriksaan lapangan dijadwalkan", "lapangan", at, `${input.jadwal} — ${input.lokasi}`);
}

export function recordFieldResult(
  app: Application,
  actor: User,
  input: { hasil: "memenuhi" | "tidak_memenuhi"; temuan: string; rekomendasi: string; catatan: string; bukti: string[] },
  at = iso(),
) {
  assertRole(actor, ["petugas"]);
  assertStatus(app, ["pemeriksaan_lapangan"]);
  if (app.field?.status !== "dijadwalkan") throw new WorkflowError("Pemeriksaan lapangan belum dijadwalkan.");
  if (!input.temuan.trim()) throw new WorkflowError("Temuan pemeriksaan wajib diisi.");
  const field: FieldExamination = { ...app.field, ...input, bukti: [...app.field.bukti, ...input.bukti], status: "selesai", updatedAt: at };
  if (input.hasil === "memenuhi") {
    return log({ ...app, field, status: "menunggu_persetujuan" }, actor, "Hasil pemeriksaan lapangan: Memenuhi", "persetujuan", at, input.temuan);
  }
  return log(
    {
      ...app,
      field,
      status: "perlu_perbaikan",
      revisions: [...app.revisions, { id: `rev-${at}`, createdAt: at, by: actor.name, source: "lapangan", note: input.rekomendasi || input.temuan, items: [] }],
    },
    actor,
    "Hasil pemeriksaan lapangan: Tidak Memenuhi",
    "perbaikan",
    at,
    input.temuan,
  );
}

export function replaceRevisionDocument(app: Application, actor: User, key: string, file: { name: string; size: number }, at = iso()) {
  assertOwner(app, actor);
  assertStatus(app, ["perlu_perbaikan"]);
  const doc = app.documents.find((d) => d.key === key);
  if (!doc || (doc.status !== "perlu_perbaikan" && doc.status !== "diperbaiki"))
    throw new WorkflowError("Dokumen ini terkunci dan tidak dapat diubah.");
  return {
    ...app,
    updatedAt: at,
    documents: app.documents.map((d) =>
      d.key === key ? { ...d, fileName: file.name, fileSize: file.size, uploadedAt: at, version: d.version + 1, status: "diperbaiki" as const } : d,
    ),
  };
}

export function updateContact(app: Application, actor: User, contact: { telepon: string; email: string }, at = iso()) {
  assertOwner(app, actor);
  assertStatus(app, ["perlu_perbaikan"]);
  return { ...app, updatedAt: at, applicant: { ...app.applicant, ...contact } };
}

export function resubmit(app: Application, actor: User, response: string, at = iso()) {
  assertOwner(app, actor);
  assertStatus(app, ["perlu_perbaikan"]);
  if (app.documents.some((d) => d.status === "perlu_perbaikan"))
    throw new WorkflowError("Masih ada dokumen yang perlu diperbaiki.");
  const revisions = app.revisions.map((r, i) => (i === app.revisions.length - 1 ? { ...r, resolvedAt: at, response } : r));
  return log({ ...app, status: "diajukan_kembali", revisions }, actor, "Perbaikan diajukan kembali oleh pemohon", "perbaikan", at, response || undefined);
}

export function approvalBlockers(app: Application): string[] {
  const out: string[] = [];
  if (app.documents.some((d) => d.fileName && d.status !== "diterima")) out.push("Masih ada dokumen yang belum diterima.");
  if (missingRequiredDocs(app).length) out.push("Dokumen wajib belum lengkap.");
  if (app.service === "PJKNK" && app.field?.hasil !== "memenuhi") out.push("Pemeriksaan lapangan belum dinyatakan memenuhi.");
  return out;
}

export function decide(app: Application, actor: User, decision: ApprovalDecision["decision"], comment: string, docKeys: string[] = [], at = iso()) {
  assertRole(actor, ["pejabat"]);
  assertStatus(app, ["menunggu_persetujuan"]);
  if (decision !== "setuju" && !comment.trim()) throw new WorkflowError("Catatan keputusan wajib diisi.");
  const approval: ApprovalDecision = { decision, by: actor.name, at, comment };
  if (decision === "setuju") {
    const blockers = approvalBlockers(app);
    if (blockers.length) throw new WorkflowError(blockers[0]);
    return log({ ...app, approval, status: "penerbitan_skp", skp: { status: "menunggu_penerbitan" } }, actor, "Disetujui oleh pejabat berwenang", "penerbitan", at, comment || undefined);
  }
  if (decision === "kembalikan") {
    return log(
      {
        ...app,
        approval,
        status: "perlu_perbaikan",
        documents: app.documents.map((d) => (docKeys.includes(d.key) ? { ...d, status: "perlu_perbaikan" as const, note: comment } : d)),
        revisions: [...app.revisions, { id: `rev-${at}`, createdAt: at, by: actor.name, source: "persetujuan", note: comment, items: docKeys }],
      },
      actor,
      "Dikembalikan pejabat untuk perbaikan",
      "perbaikan",
      at,
      comment,
    );
  }
  return log({ ...app, approval, status: "ditolak", completedAt: at }, actor, "Pengajuan ditolak", "persetujuan", at, comment);
}

export function assignSkpNumber(app: Application, actor: User, nomor: string, at = iso()) {
  assertRole(actor, ["petugas"]);
  assertStatus(app, ["penerbitan_skp"]);
  if (app.skp?.status !== "menunggu_penerbitan") throw new WorkflowError("Nomor SKP sudah ditetapkan.");
  if (!/^[A-Z0-9./-]{6,40}$/i.test(nomor.trim())) throw new WorkflowError("Format nomor SKP tidak valid.");
  const until = new Date(at);
  until.setFullYear(until.getFullYear() + 3);
  return log(
    { ...app, skp: { status: "nomor_ditetapkan", nomor: nomor.trim(), ditetapkanAt: at, berlakuSampai: until.toISOString() } },
    actor,
    "Nomor SKP ditetapkan",
    "penerbitan",
    at,
    nomor.trim(),
  );
}

export function sendToSignature(app: Application, actor: User, at = iso()) {
  assertRole(actor, ["petugas"]);
  assertStatus(app, ["penerbitan_skp"]);
  if (app.skp?.status !== "nomor_ditetapkan" && app.skp?.status !== "tte_gagal")
    throw new WorkflowError("Tetapkan nomor SKP terlebih dahulu.");
  return log({ ...app, skp: { ...app.skp, status: "menunggu_tte" } }, actor, "Dokumen dikirim ke proses TTE (prototipe)", "penerbitan", at);
}

export function recordSignatureResult(app: Application, actor: User, success: boolean, note: string, at = iso()) {
  assertRole(actor, ["petugas"]);
  assertStatus(app, ["penerbitan_skp"]);
  if (app.skp?.status !== "menunggu_tte") throw new WorkflowError("Dokumen belum dikirim ke proses TTE.");
  if (!success) {
    return log({ ...app, skp: { ...app.skp, status: "tte_gagal", catatan: note } }, actor, "Proses TTE gagal", "penerbitan", at, note);
  }
  return log(
    { ...app, status: "finalisasi", skp: { ...app.skp, status: "tte_berhasil", tteAt: at, catatan: note || undefined }, delivery: { status: "belum" } },
    actor,
    "TTE berhasil dicatat (prototipe)",
    "finalisasi",
    at,
  );
}

export function recordDelivery(app: Application, actor: User, input: { metode: string; catatan: string }, at = iso()) {
  assertRole(actor, ["petugas"]);
  assertStatus(app, ["finalisasi"]);
  if (app.skp?.status !== "tte_berhasil") throw new WorkflowError("Dokumen belum ditandatangani.");
  if (!input.metode) throw new WorkflowError("Metode penyampaian wajib dipilih.");
  return log(
    { ...app, status: "selesai", completedAt: at, delivery: { status: "terkirim", at, by: actor.name, ...input } },
    actor,
    "Dokumen disampaikan kepada pemohon",
    "selesai",
    at,
    input.catatan || undefined,
  );
}

// ---------- Timeline ----------

export type StageState = "done" | "current" | "upcoming" | "attention" | "rejected";

export function stagesFor(app: Application): { key: StageKey; label: string; state: StageState; at?: string | undefined; note?: string | undefined }[] {
  const showRevision = app.revisions.length > 0 || app.status === "perlu_perbaikan";
  const keys: StageKey[] = [
    "diajukan",
    "pemeriksaan_dokumen",
    ...(showRevision ? (["perbaikan"] as StageKey[]) : []),
    ...(app.service === "PJKNK" ? (["lapangan"] as StageKey[]) : []),
    "persetujuan",
    "penerbitan",
    "finalisasi",
    "selesai",
  ];
  const currentByStatus: Record<AppStatus, StageKey> = {
    draft: "diajukan",
    diajukan: "pemeriksaan_dokumen",
    pemeriksaan_dokumen: "pemeriksaan_dokumen",
    perlu_perbaikan: "perbaikan",
    diajukan_kembali: "perbaikan",
    pemeriksaan_lapangan: "lapangan",
    menunggu_persetujuan: "persetujuan",
    penerbitan_skp: "penerbitan",
    finalisasi: "finalisasi",
    selesai: "selesai",
    ditolak: "persetujuan",
  };
  const current = currentByStatus[app.status];
  const ci = keys.indexOf(current);
  return keys.map((key, i) => {
    const last = [...app.history].reverse().find((h) => h.stage === key);
    let state: StageState = i < ci ? "done" : i === ci ? "current" : "upcoming";
    if (app.status === "selesai") state = "done";
    if (i === ci && app.status === "perlu_perbaikan") state = "attention";
    if (i === ci && app.status === "ditolak") state = "rejected";
    if (app.status === "draft" && i === 0) state = "current";
    return { key, label: STAGE_LABEL[key], state, at: last?.at, note: last?.action };
  });
}
