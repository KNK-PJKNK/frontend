import type { AppStatus, DocReviewStatus, RequestType, ServiceType, SkpStatus, StageKey } from "@/types";

export type Tone = "neutral" | "info" | "warning" | "success" | "danger";

export const STATUS_META: Record<AppStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draf", tone: "neutral" },
  diajukan: { label: "Diajukan", tone: "info" },
  pemeriksaan_dokumen: { label: "Pemeriksaan Dokumen", tone: "info" },
  perlu_perbaikan: { label: "Perlu Perbaikan", tone: "warning" },
  diajukan_kembali: { label: "Diajukan Kembali", tone: "info" },
  pemeriksaan_lapangan: { label: "Pemeriksaan Lapangan", tone: "info" },
  menunggu_persetujuan: { label: "Menunggu Persetujuan", tone: "info" },
  penerbitan_skp: { label: "Penerbitan SKP & TTE", tone: "info" },
  finalisasi: { label: "Finalisasi", tone: "info" },
  selesai: { label: "Selesai", tone: "success" },
  ditolak: { label: "Ditolak", tone: "danger" },
};

export const DOC_STATUS_META: Record<DocReviewStatus, { label: string; tone: Tone }> = {
  belum_diperiksa: { label: "Belum Diperiksa", tone: "neutral" },
  perlu_perbaikan: { label: "Perlu Perbaikan", tone: "warning" },
  diperbaiki: { label: "Diperbaiki", tone: "info" },
  diterima: { label: "Diterima", tone: "success" },
};

export const SKP_STATUS_META: Record<SkpStatus, { label: string; tone: Tone }> = {
  menunggu_penerbitan: { label: "Menunggu Penerbitan", tone: "neutral" },
  nomor_ditetapkan: { label: "Nomor SKP Ditetapkan", tone: "info" },
  menunggu_tte: { label: "Menunggu TTE", tone: "warning" },
  tte_berhasil: { label: "TTE Berhasil", tone: "success" },
  tte_gagal: { label: "TTE Gagal — Perlu Tindak Lanjut", tone: "danger" },
};

export const SERVICE_LABEL: Record<ServiceType, string> = {
  KNK: "Kader Norma Ketenagakerjaan (KNK)",
  PJKNK: "Penguji K3 Norma Ketenagakerjaan (PJKNK)",
};

export const REQUEST_LABEL: Record<RequestType, string> = {
  baru: "Pengajuan Baru",
  perpanjangan: "Perpanjangan",
};

export const STAGE_LABEL: Record<StageKey, string> = {
  diajukan: "Pengajuan Dikirim",
  pemeriksaan_dokumen: "Pemeriksaan Dokumen",
  perbaikan: "Perbaikan Dokumen",
  lapangan: "Pemeriksaan Lapangan PJKNK",
  persetujuan: "Review dan Persetujuan Pejabat",
  penerbitan: "Penerbitan Nomor SKP dan Proses TTE",
  finalisasi: "Finalisasi dan Penyampaian Dokumen",
  selesai: "Selesai",
};

/** Next expected stage shown to applicants. */
export const NEXT_STEP_HINT: Partial<Record<AppStatus, string>> = {
  draft: "Lengkapi data dan kirim pengajuan.",
  diajukan: "Menunggu pemeriksaan dokumen oleh tim kerja.",
  pemeriksaan_dokumen: "Dokumen sedang diperiksa oleh tim kerja.",
  perlu_perbaikan: "Perbaiki dokumen sesuai catatan, lalu ajukan kembali.",
  diajukan_kembali: "Menunggu pemeriksaan ulang oleh tim kerja.",
  pemeriksaan_lapangan: "Menunggu hasil pemeriksaan lapangan.",
  menunggu_persetujuan: "Menunggu review dan keputusan pejabat berwenang.",
  penerbitan_skp: "Nomor SKP dan tanda tangan elektronik sedang diproses.",
  finalisasi: "Dokumen sedang difinalisasi untuk disampaikan.",
  selesai: "Proses selesai. Dokumen dapat diunduh.",
  ditolak: "Pengajuan tidak dapat dilanjutkan.",
};

export interface DocRequirement {
  key: string;
  name: string;
  required: boolean;
}

/** Illustrative requirement configuration — replace with official rules. */
export const DOC_REQUIREMENTS: Record<ServiceType, Record<RequestType, DocRequirement[]>> = {
  KNK: {
    baru: [
      { key: "ktp", name: "KTP Pemohon", required: true },
      { key: "ijazah", name: "Ijazah Pendidikan Terakhir", required: true },
      { key: "penunjukan", name: "Surat Penunjukan dari Perusahaan", required: true },
      { key: "sertifikat_pelatihan", name: "Sertifikat Pelatihan KNK", required: true },
      { key: "foto", name: "Pas Foto Terbaru", required: true },
      { key: "cv", name: "Daftar Riwayat Hidup", required: false },
    ],
    perpanjangan: [
      { key: "ktp", name: "KTP Pemohon", required: true },
      { key: "skp_lama", name: "SKP KNK Sebelumnya", required: true },
      { key: "laporan_kegiatan", name: "Laporan Kegiatan KNK", required: true },
      { key: "penunjukan", name: "Surat Penunjukan dari Perusahaan", required: true },
      { key: "foto", name: "Pas Foto Terbaru", required: true },
    ],
  },
  PJKNK: {
    baru: [
      { key: "ktp", name: "KTP Pemohon", required: true },
      { key: "ijazah", name: "Ijazah Pendidikan Terakhir", required: true },
      { key: "sertifikat_kompetensi", name: "Sertifikat Kompetensi Penguji", required: true },
      { key: "rekomendasi", name: "Surat Rekomendasi Instansi", required: true },
      { key: "peralatan", name: "Daftar Peralatan Pengujian", required: true },
      { key: "foto", name: "Pas Foto Terbaru", required: true },
      { key: "portofolio", name: "Portofolio Pengujian", required: false },
    ],
    perpanjangan: [
      { key: "ktp", name: "KTP Pemohon", required: true },
      { key: "skp_lama", name: "SKP PJKNK Sebelumnya", required: true },
      { key: "laporan_pengujian", name: "Laporan Pelaksanaan Pengujian", required: true },
      { key: "rekomendasi", name: "Surat Rekomendasi Instansi", required: true },
      { key: "kalibrasi", name: "Sertifikat Kalibrasi Peralatan", required: true },
    ],
  },
};

export const UPLOAD_RULES = {
  accept: ".pdf,.jpg,.jpeg,.png",
  extensions: ["pdf", "jpg", "jpeg", "png"],
  maxBytes: 2 * 1024 * 1024,
  label: "PDF, JPG, atau PNG — maks. 2 MB",
};

/** Days without progress after which a staff-side item is flagged as overdue. */
export const SLA_DAYS = 5;
