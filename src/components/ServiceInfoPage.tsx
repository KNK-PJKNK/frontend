import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Section } from "@/components/common";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DOC_REQUIREMENTS, REQUEST_LABEL, SERVICE_LABEL, STAGE_LABEL, UPLOAD_RULES } from "@/constants/workflow";
import type { ServiceType, StageKey } from "@/types";

const CONTENT: Record<ServiceType, { overview: string; requirements: string[]; faq: [string, string][] }> = {
  KNK: {
    overview:
      "Kader Norma Ketenagakerjaan (KNK) adalah pekerja yang ditunjuk perusahaan untuk membantu sosialisasi dan penerapan norma ketenagakerjaan di tempat kerja. Layanan ini memproses penerbitan Surat Keputusan Penunjukan (SKP) KNK.",
    requirements: ["Warga Negara Indonesia dan memiliki KTP", "Bekerja pada perusahaan yang mengajukan", "Telah mengikuti pelatihan KNK", "Mendapat penunjukan tertulis dari pimpinan perusahaan"],
    faq: [
      ["Berapa lama proses pengajuan?", "Durasi bergantung pada kelengkapan dokumen dan antrean pemeriksaan. Status setiap tahap dapat dipantau di dasbor pemohon."],
      ["Apakah KNK memerlukan pemeriksaan lapangan?", "Tidak. Pemeriksaan lapangan hanya berlaku untuk layanan PJKNK."],
    ],
  },
  PJKNK: {
    overview:
      "Penguji K3 Norma Ketenagakerjaan (PJKNK) adalah tenaga yang ditunjuk untuk melaksanakan pengujian aspek keselamatan dan kesehatan kerja. Layanan PJKNK mencakup pemeriksaan lapangan sebelum keputusan pejabat berwenang.",
    requirements: ["Memiliki sertifikat kompetensi penguji yang masih berlaku", "Mendapat rekomendasi dari instansi/lembaga", "Memiliki peralatan pengujian yang terkalibrasi", "Bersedia mengikuti pemeriksaan lapangan"],
    faq: [
      ["Apa yang diperiksa saat pemeriksaan lapangan?", "Kesesuaian peralatan, prosedur kerja, dan dokumen pendukung di lokasi. Checklist final mengikuti prosedur resmi."],
      ["Bagaimana jika hasil lapangan tidak memenuhi?", "Pengajuan dikembalikan untuk perbaikan disertai catatan dan rekomendasi tindak lanjut."],
    ],
  },
};

export function ServiceInfoPage({ service }: { service: ServiceType }) {
  const c = CONTENT[service];
  const stages: StageKey[] = ["diajukan", "pemeriksaan_dokumen", ...(service === "PJKNK" ? (["lapangan"] as StageKey[]) : []), "persetujuan", "penerbitan", "finalisasi"];
  return (
    <PublicLayout>
      <section className="bg-hero text-navy-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm font-medium text-navy-foreground/70">Informasi Layanan</p>
          <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">Layanan {service}</h1>
          <p className="mt-1 text-lg text-navy-foreground/85">{SERVICE_LABEL[service]}</p>
          <p className="mt-4 max-w-3xl text-navy-foreground/80">{c.overview}</p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/masuk">
              Mulai Pengajuan {service} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Persyaratan Pemohon">
            <ul className="space-y-2">
              {c.requirements.map((r) => (
                <li key={r} className="flex gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {r}
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Dokumen yang Diperlukan" description={`Format: ${UPLOAD_RULES.label}. Daftar bersifat ilustratif hingga persyaratan resmi dikonfirmasi.`}>
            <div className="grid gap-6 md:grid-cols-2">
              {(["baru", "perpanjangan"] as const).map((t) => (
                <div key={t}>
                  <p className="mb-2 text-sm font-semibold text-navy">{REQUEST_LABEL[t]}</p>
                  <ul className="space-y-2">
                    {DOC_REQUIREMENTS[service][t].map((d) => (
                      <li key={d.key} className="flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                        <span className="flex gap-2">
                          {d.required ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                          {d.name}
                        </span>
                        <span className={d.required ? "text-xs font-semibold text-primary" : "text-xs text-muted-foreground"}>{d.required ? "Wajib" : "Opsional"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Pertanyaan Umum">
            <Accordion type="single" collapsible>
              {c.faq.map(([q, a]) => (
                <AccordionItem key={q} value={q}>
                  <AccordionTrigger>{q}</AccordionTrigger>
                  <AccordionContent>{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>
        </div>
        <div className="space-y-6">
          <Section title="Tahapan Layanan">
            <ol className="space-y-3">
              {stages.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-navy">{i + 1}</span>
                  <span className="pt-0.5 text-foreground">{STAGE_LABEL[s]}</span>
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Baru vs. Perpanjangan">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Pengajuan baru</strong> untuk pemohon yang belum pernah memiliki SKP {service}.{" "}
              <strong className="text-foreground">Perpanjangan</strong> untuk pemegang SKP yang masa berlakunya akan atau telah berakhir, dengan melampirkan SKP sebelumnya dan laporan kegiatan.
            </p>
          </Section>
        </div>
      </div>
    </PublicLayout>
  );
}
