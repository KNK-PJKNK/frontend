import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileCheck2, FileSearch, HardHat, ScrollText, ShieldCheck, Users } from "lucide-react";
import heroImg from "@/assets/hero-k3.jpg";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sistem Layanan KNK & PJKNK 2026 — Beranda" },
      { name: "description", content: "Ajukan, pantau, dan selesaikan permohonan SKP Kader Norma Ketenagakerjaan dan Penguji K3 Norma Ketenagakerjaan secara daring." },
      { property: "og:title", content: "Sistem Layanan KNK & PJKNK 2026" },
      { property: "og:description", content: "Layanan terpadu pengajuan dan penerbitan SKP KNK dan PJKNK." },
    ],
  }),
  component: Home,
});

const STEPS = [
  { t: "Pengajuan", d: "Isi data pemohon dan perusahaan, lalu unggah dokumen persyaratan." },
  { t: "Pemeriksaan Dokumen", d: "Tim kerja memeriksa kelengkapan dan kesesuaian dokumen." },
  { t: "Pemeriksaan Lapangan", d: "Khusus PJKNK — verifikasi langsung di lokasi." },
  { t: "Persetujuan Pejabat", d: "Pejabat berwenang meninjau dan memberi keputusan." },
  { t: "Penerbitan SKP & TTE", d: "Nomor SKP ditetapkan dan dokumen ditandatangani elektronik." },
  { t: "Penyampaian Dokumen", d: "Dokumen final disampaikan dan dapat diunduh pemohon." },
];

function Home() {
  return (
    <PublicLayout>
      <section className="bg-hero text-navy-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-navy-foreground/25 px-3 py-1 text-xs font-medium">Layanan Daring Terpadu</p>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">Sistem Layanan KNK & PJKNK 2026</h1>
            <p className="mt-4 max-w-lg text-base text-navy-foreground/80">
              Ajukan permohonan baru maupun perpanjangan Surat Keputusan Penunjukan, pantau setiap tahap proses, dan terima dokumen final — semua dalam satu tempat.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary">
                <Link to="/masuk">
                  Mulai Pengajuan <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-navy-foreground/40 bg-transparent text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground">
                <Link to="/cek-skp">Cek Status SKP</Link>
              </Button>
            </div>
          </div>
          <img src={heroImg} alt="Petugas K3 meninjau dokumen bersama pekerja di fasilitas industri" width={1280} height={960} className="aspect-[4/3] w-full rounded-lg object-cover shadow-2xl" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold text-foreground">Pilih Layanan</h2>
        <p className="mt-1 text-muted-foreground">Dua layanan penunjukan dengan alur dan persyaratan yang berbeda.</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {[
            { to: "/layanan/knk" as const, icon: Users, t: "Layanan KNK", s: "Kader Norma Ketenagakerjaan", d: "Penunjukan kader di perusahaan untuk mendorong penerapan norma ketenagakerjaan." },
            { to: "/layanan/pjknk" as const, icon: HardHat, t: "Layanan PJKNK", s: "Penguji K3 Norma Ketenagakerjaan", d: "Penunjukan penguji K3, termasuk tahap pemeriksaan lapangan sebelum persetujuan." },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="surface group flex gap-4 p-6 transition-colors hover:border-primary/50">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-info-soft text-primary">
                <c.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-lg font-bold text-foreground">{c.t}</p>
                <p className="text-sm font-medium text-teal">{c.s}</p>
                <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Lihat persyaratan <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-foreground">Alur Layanan</h2>
          <p className="mt-1 text-muted-foreground">Setiap tahap tercatat dan dapat dipantau oleh pemohon.</p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-3 rounded-lg border p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-navy-foreground">{i + 1}</span>
                <div>
                  <p className="font-semibold text-foreground">{s.t}</p>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 md:grid-cols-3">
        {[
          { icon: ScrollText, t: "Persyaratan Umum", d: "Identitas pemohon, data perusahaan/instansi, serta dokumen pendukung sesuai jenis layanan." },
          { icon: FileCheck2, t: "Format Dokumen", d: "Unggah berkas PDF, JPG, atau PNG dengan ukuran maksimal 2 MB per dokumen." },
          { icon: ShieldCheck, t: "Perpanjangan", d: "Siapkan SKP sebelumnya dan laporan kegiatan selama masa penunjukan." },
        ].map((c) => (
          <div key={c.t} className="surface p-5">
            <c.icon className="h-6 w-6 text-teal" />
            <p className="mt-3 font-semibold text-foreground">{c.t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="surface flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
          <div className="flex gap-4">
            <FileSearch className="h-8 w-8 shrink-0 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">Cek keabsahan SKP</p>
              <p className="text-sm text-muted-foreground">Masukkan nomor SKP untuk melihat status penerbitan dan masa berlakunya.</p>
            </div>
          </div>
          <Button asChild>
            <Link to="/cek-skp">Cek Status SKP</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
