import { createFileRoute } from "@tanstack/react-router";
import { ServiceInfoPage } from "@/components/ServiceInfoPage";

export const Route = createFileRoute("/layanan/knk")({
  head: () => ({
    meta: [
      { title: "Layanan KNK — Persyaratan & Tahapan" },
      { name: "description", content: "Persyaratan, dokumen, dan tahapan pengajuan SKP Kader Norma Ketenagakerjaan (KNK)." },
      { property: "og:title", content: "Layanan KNK — Persyaratan & Tahapan" },
      { property: "og:description", content: "Informasi lengkap pengajuan baru dan perpanjangan KNK." },
    ],
  }),
  component: () => <ServiceInfoPage service="KNK" />,
});
