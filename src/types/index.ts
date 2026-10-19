// Proposed domain entities — not a finalized database schema.

export type ServiceType = "KNK" | "PJKNK";
export type RequestType = "baru" | "perpanjangan";
export type Role = "pemohon" | "petugas" | "pejabat";

export type AppStatus =
  | "draft"
  | "diajukan"
  | "pemeriksaan_dokumen"
  | "perlu_perbaikan"
  | "diajukan_kembali"
  | "pemeriksaan_lapangan"
  | "menunggu_persetujuan"
  | "penerbitan_skp"
  | "finalisasi"
  | "selesai"
  | "ditolak";

export type DocReviewStatus = "belum_diperiksa" | "perlu_perbaikan" | "diperbaiki" | "diterima";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  unit?: string | undefined;
}

export interface ApplicantInfo {
  nama: string;
  nik: string;
  email: string;
  telepon: string;
  jabatan: string;
  pendidikan: string;
}

export interface Organization {
  nama: string;
  npwp: string;
  alamat: string;
  kota: string;
  provinsi: string;
  sektor: string;
  jumlahPekerja: number;
}

export interface ApplicationDocument {
  key: string;
  name: string;
  required: boolean;
  fileName?: string | undefined;
  fileSize?: number | undefined;
  uploadedAt?: string | undefined;
  version: number;
  status: DocReviewStatus;
  note?: string | undefined;
}

export interface RevisionRequest {
  id: string;
  createdAt: string;
  by: string;
  source: "verifikasi" | "lapangan" | "persetujuan";
  note: string;
  items: string[];
  resolvedAt?: string | undefined;
  response?: string | undefined;
}

export interface FieldExamination {
  status: "belum_dijadwalkan" | "dijadwalkan" | "selesai";
  jadwal?: string | undefined;
  lokasi?: string | undefined;
  petugas?: string | undefined;
  hasil?: "memenuhi" | "tidak_memenuhi" | undefined;
  temuan?: string | undefined;
  rekomendasi?: string | undefined;
  catatan?: string | undefined;
  bukti: string[];
  updatedAt?: string | undefined;
}

export interface ApprovalDecision {
  decision: "setuju" | "kembalikan" | "tolak";
  by: string;
  at: string;
  comment: string;
}

export type SkpStatus =
  | "menunggu_penerbitan"
  | "nomor_ditetapkan"
  | "menunggu_tte"
  | "tte_berhasil"
  | "tte_gagal";

export interface SKPRecord {
  status: SkpStatus;
  nomor?: string | undefined;
  ditetapkanAt?: string | undefined;
  tteAt?: string | undefined;
  berlakuSampai?: string | undefined;
  catatan?: string | undefined;
}

/** Placeholder for the official e-signature service transaction. */
export interface SignatureTransaction {
  id: string;
  appId: string;
  status: "pending" | "success" | "failed";
  requestedAt: string;
  completedAt?: string | undefined;
}

export interface DocumentDelivery {
  status: "belum" | "terkirim";
  at?: string | undefined;
  by?: string | undefined;
  metode?: string | undefined;
  catatan?: string | undefined;
}

export type StageKey =
  | "diajukan"
  | "pemeriksaan_dokumen"
  | "perbaikan"
  | "lapangan"
  | "persetujuan"
  | "penerbitan"
  | "finalisasi"
  | "selesai";

export interface HistoryEntry {
  at: string;
  by: string;
  action: string;
  stage: StageKey;
  note?: string | undefined;
}

export interface Application {
  id: string;
  ownerId: string;
  service: ServiceType;
  requestType: RequestType;
  status: AppStatus;
  createdAt: string;
  submittedAt?: string | undefined;
  completedAt?: string | undefined;
  updatedAt: string;
  assignee?: string | undefined;
  applicant: ApplicantInfo;
  organization: Organization;
  documents: ApplicationDocument[];
  revisions: RevisionRequest[];
  field?: FieldExamination | undefined;
  approval?: ApprovalDecision | undefined;
  skp?: SKPRecord | undefined;
  delivery?: DocumentDelivery | undefined;
  history: HistoryEntry[];
}

export interface AuditLog extends HistoryEntry {
  appId: string;
}

export interface Notification {
  id: string;
  userId: string;
  at: string;
  text: string;
  appId: string;
  read: boolean;
}
