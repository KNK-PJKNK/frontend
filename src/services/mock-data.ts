// @ts-nocheck -- illustrative seed builder
// Illustrative demo records — NOT official operational data.
import { buildDocuments } from "@/lib/workflow";
import type { Application, AppStatus, HistoryEntry, Notification, RequestType, ServiceType, User } from "@/types";

export const DEMO_PASSWORD = "demo2026";

export const DEMO_USERS: User[] = [
  { id: "u-pemohon", name: "Budi Santoso", email: "pemohon@contoh.id", role: "pemohon" },
  { id: "u-petugas", name: "Sari Wulandari", email: "petugas@contoh.id", role: "petugas", unit: "Tim Kerja Verifikasi" },
  { id: "u-pejabat", name: "Hendra Gunawan", email: "pejabat@contoh.id", role: "pejabat", unit: "Pejabat Berwenang" },
];

const ORGS = [
  { nama: "PT Sinar Logam Nusantara", kota: "Bekasi", provinsi: "Jawa Barat", sektor: "Manufaktur" },
  { nama: "PT Arunika Tekstil", kota: "Bandung", provinsi: "Jawa Barat", sektor: "Tekstil" },
  { nama: "PT Bahari Energi Mandiri", kota: "Balikpapan", provinsi: "Kalimantan Timur", sektor: "Energi" },
  { nama: "CV Karya Konstruksi Utama", kota: "Surabaya", provinsi: "Jawa Timur", sektor: "Konstruksi" },
  { nama: "PT Pangan Sejahtera", kota: "Semarang", provinsi: "Jawa Tengah", sektor: "Pengolahan Pangan" },
  { nama: "Lembaga Uji K3 Prima", kota: "Jakarta Selatan", provinsi: "DKI Jakarta", sektor: "Jasa Pengujian K3" },
];

interface SeedInput {
  id: string;
  ownerId: string;
  nama: string;
  service: ServiceType;
  requestType: RequestType;
  status: AppStatus;
  org: number;
  created: string; // ISO date
  daysPerStep?: number;
}

const add = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * 86400000).toISOString();

function seed(s: SeedInput): Application {
  const step = s.daysPerStep ?? 2;
  const o = ORGS[s.org];
  const docs = buildDocuments(s.service, s.requestType).map((d, i) => ({
    ...d,
    fileName: s.status === "draft" && i > 2 ? undefined : `${d.key}_${s.nama.split(" ")[0].toLowerCase()}.pdf`,
    fileSize: 180000 + i * 41000,
    uploadedAt: s.created,
    version: s.status === "draft" && i > 2 ? 0 : 1,
  }));
  const app: Application = {
    id: s.id,
    ownerId: s.ownerId,
    service: s.service,
    requestType: s.requestType,
    status: s.status,
    createdAt: s.created,
    updatedAt: s.created,
    applicant: {
      nama: s.nama,
      nik: "3201" + s.id.replace(/\D/g, "").padStart(12, "0").slice(-12),
      email: `${s.nama.split(" ")[0].toLowerCase()}@contoh.id`,
      telepon: "0812-3456-" + s.id.slice(-4),
      jabatan: s.service === "KNK" ? "Staf HRD & Hubungan Industrial" : "Ahli K3 Umum",
      pendidikan: "S1",
    },
    organization: {
      nama: o.nama,
      npwp: "01.234.567.8-" + s.id.slice(-3) + ".000",
      alamat: "Jl. Industri Raya No. " + (s.org + 12),
      kota: o.kota,
      provinsi: o.provinsi,
      sektor: o.sektor,
      jumlahPekerja: 120 + s.org * 85,
    },
    documents: docs,
    revisions: [],
    history: [],
  };
  if (s.status === "draft") return app;

  const h: HistoryEntry[] = [];
  let t = s.created;
  const next = () => (t = add(t, step));
  h.push({ at: t, by: s.nama, action: "Pengajuan dikirim oleh pemohon", stage: "diajukan" });
  app.submittedAt = t;
  const order: AppStatus[] = ["diajukan", "pemeriksaan_dokumen", "perlu_perbaikan", "diajukan_kembali", "pemeriksaan_lapangan", "menunggu_persetujuan", "penerbitan_skp", "finalisasi", "selesai"];
  const target = order.indexOf(s.status);
  const reached = (st: AppStatus) => order.indexOf(st) <= target;

  if (reached("pemeriksaan_dokumen")) {
    h.push({ at: next(), by: "Sari Wulandari", action: "Pemeriksaan dokumen dimulai", stage: "pemeriksaan_dokumen" });
    app.assignee = "Sari Wulandari";
  }
  const withRevision = s.status === "perlu_perbaikan" || s.status === "diajukan_kembali";
  if (withRevision) {
    const bad = docs[2];
    bad.status = "perlu_perbaikan";
    bad.note = "Dokumen tidak terbaca jelas dan belum ditandatangani pimpinan perusahaan. Unggah ulang hasil pindai berwarna.";
    docs.forEach((d) => d !== bad && d.fileName && (d.status = "diterima"));
    const at = next();
    app.revisions.push({ id: "rev-" + s.id, createdAt: at, by: "Sari Wulandari", source: "verifikasi", note: "Mohon perbaiki dokumen yang ditandai sebelum pemeriksaan dilanjutkan.", items: [bad.key] });
    h.push({ at, by: "Sari Wulandari", action: "Pengajuan dikembalikan untuk perbaikan", stage: "perbaikan", note: "Mohon perbaiki dokumen yang ditandai." });
    if (s.status === "diajukan_kembali") {
      bad.status = "diperbaiki";
      bad.version = 2;
      const at2 = next();
      app.revisions[0].resolvedAt = at2;
      app.revisions[0].response = "Dokumen telah dipindai ulang dan ditandatangani.";
      h.push({ at: at2, by: s.nama, action: "Perbaikan diajukan kembali oleh pemohon", stage: "perbaikan" });
    }
  } else if (target >= order.indexOf("pemeriksaan_lapangan")) {
    docs.forEach((d) => d.fileName && (d.status = "diterima"));
    if (s.service === "PJKNK") {
      h.push({ at: next(), by: "Sari Wulandari", action: "Dokumen lengkap, diteruskan ke pemeriksaan lapangan", stage: "lapangan" });
      app.field = { status: "belum_dijadwalkan", bukti: [] };
      if (s.status === "pemeriksaan_lapangan") {
        app.field = { status: "dijadwalkan", jadwal: add(t, 3).slice(0, 10), lokasi: o.nama + ", " + o.kota, petugas: "Tim Pemeriksa Wilayah II", bukti: [] };
        h.push({ at: next(), by: "Sari Wulandari", action: "Pemeriksaan lapangan dijadwalkan", stage: "lapangan" });
      }
    }
  }
  if (reached("menunggu_persetujuan") && !withRevision) {
    if (s.service === "PJKNK") {
      app.field = { status: "selesai", jadwal: add(t, 1).slice(0, 10), lokasi: o.nama + ", " + o.kota, petugas: "Tim Pemeriksa Wilayah II", hasil: "memenuhi", temuan: "Peralatan pengujian lengkap dan terkalibrasi; prosedur kerja terdokumentasi.", rekomendasi: "Layak dilanjutkan ke tahap persetujuan.", bukti: ["foto_peralatan.jpg", "berita_acara_pemeriksaan.pdf"], updatedAt: next() };
      h.push({ at: t, by: "Sari Wulandari", action: "Hasil pemeriksaan lapangan: Memenuhi", stage: "persetujuan" });
    } else {
      h.push({ at: next(), by: "Sari Wulandari", action: "Dokumen lengkap, diteruskan ke pejabat", stage: "persetujuan" });
    }
  }
  if (reached("penerbitan_skp") && !withRevision) {
    const at = next();
    app.approval = { decision: "setuju", by: "Hendra Gunawan", at, comment: "Persyaratan terpenuhi." };
    h.push({ at, by: "Hendra Gunawan", action: "Disetujui oleh pejabat berwenang", stage: "penerbitan" });
    app.skp = { status: "menunggu_penerbitan" };
    if (s.status !== "penerbitan_skp" || s.id.endsWith("7")) {
      const nomorAt = next();
      const until = new Date(nomorAt);
      until.setFullYear(until.getFullYear() + 3);
      app.skp = { status: "menunggu_tte", nomor: `DEMO/${s.service}/${s.id.slice(-4)}/2026`, ditetapkanAt: nomorAt, berlakuSampai: until.toISOString() };
      h.push({ at: nomorAt, by: "Sari Wulandari", action: "Nomor SKP ditetapkan", stage: "penerbitan" });
      h.push({ at: nomorAt, by: "Sari Wulandari", action: "Dokumen dikirim ke proses TTE (prototipe)", stage: "penerbitan" });
    }
  }
  if (reached("finalisasi") && !withRevision) {
    const at = next();
    app.skp = { ...app.skp!, status: "tte_berhasil", tteAt: at };
    app.delivery = { status: "belum" };
    h.push({ at, by: "Sari Wulandari", action: "TTE berhasil dicatat (prototipe)", stage: "finalisasi" });
  }
  if (s.status === "selesai") {
    const at = next();
    app.delivery = { status: "terkirim", at, by: "Sari Wulandari", metode: "Unduhan melalui sistem", catatan: "Dokumen SKP tersedia untuk diunduh pemohon." };
    app.completedAt = at;
    h.push({ at, by: "Sari Wulandari", action: "Dokumen disampaikan kepada pemohon", stage: "selesai" });
  }
  app.history = h;
  app.updatedAt = h[h.length - 1].at;
  return app;
}

export const SEED_APPLICATIONS: Application[] = [
  seed({ id: "KNK-2026-0001", ownerId: "u-pemohon", nama: "Budi Santoso", service: "KNK", requestType: "baru", status: "selesai", org: 0, created: "2026-07-01T02:00:00Z", daysPerStep: 3 }),
  seed({ id: "PJKNK-2026-0002", ownerId: "u-pemohon", nama: "Budi Santoso", service: "PJKNK", requestType: "baru", status: "perlu_perbaikan", org: 0, created: "2026-10-05T02:00:00Z" }),
  seed({ id: "KNK-2026-0003", ownerId: "u-pemohon", nama: "Budi Santoso", service: "KNK", requestType: "perpanjangan", status: "pemeriksaan_dokumen", org: 0, created: "2026-10-12T03:00:00Z" }),
  seed({ id: "KNK-2026-0004", ownerId: "u-pemohon", nama: "Budi Santoso", service: "KNK", requestType: "baru", status: "draft", org: 0, created: "2026-10-17T03:00:00Z" }),
  seed({ id: "PJKNK-2026-0005", ownerId: "u-dewi", nama: "Dewi Lestari", service: "PJKNK", requestType: "baru", status: "pemeriksaan_lapangan", org: 5, created: "2026-09-22T02:00:00Z" }),
  seed({ id: "KNK-2026-0006", ownerId: "u-ahmad", nama: "Ahmad Fauzi", service: "KNK", requestType: "baru", status: "menunggu_persetujuan", org: 1, created: "2026-10-02T02:00:00Z" }),
  seed({ id: "PJKNK-2026-0007", ownerId: "u-rina", nama: "Rina Marlina", service: "PJKNK", requestType: "perpanjangan", status: "penerbitan_skp", org: 2, created: "2026-09-10T02:00:00Z" }),
  seed({ id: "KNK-2026-0008", ownerId: "u-yoga", nama: "Yoga Pratama", service: "KNK", requestType: "perpanjangan", status: "finalisasi", org: 3, created: "2026-09-15T02:00:00Z" }),
  seed({ id: "KNK-2026-0009", ownerId: "u-maria", nama: "Maria Simanjuntak", service: "KNK", requestType: "baru", status: "diajukan", org: 4, created: "2026-10-08T02:00:00Z" }),
  seed({ id: "PJKNK-2026-0010", ownerId: "u-agus", nama: "Agus Setiawan", service: "PJKNK", requestType: "baru", status: "diajukan_kembali", org: 5, created: "2026-10-01T02:00:00Z" }),
  seed({ id: "KNK-2026-0011", ownerId: "u-fitri", nama: "Fitri Handayani", service: "KNK", requestType: "baru", status: "penerbitan_skp", org: 1, created: "2026-09-28T02:00:00Z" }),
  seed({ id: "PJKNK-2026-0012", ownerId: "u-rudi", nama: "Rudi Hartono", service: "PJKNK", requestType: "baru", status: "selesai", org: 2, created: "2026-06-03T02:00:00Z", daysPerStep: 4 }),
];

export const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", userId: "u-pemohon", at: SEED_APPLICATIONS[1].updatedAt, text: "Pengajuan PJKNK-2026-0002 memerlukan perbaikan dokumen.", appId: "PJKNK-2026-0002", read: false },
  { id: "n2", userId: "u-pemohon", at: SEED_APPLICATIONS[2].updatedAt, text: "Pengajuan KNK-2026-0003 sedang diperiksa tim kerja.", appId: "KNK-2026-0003", read: false },
  { id: "n3", userId: "u-pemohon", at: SEED_APPLICATIONS[0].updatedAt, text: "Dokumen SKP untuk KNK-2026-0001 telah disampaikan.", appId: "KNK-2026-0001", read: true },
];
