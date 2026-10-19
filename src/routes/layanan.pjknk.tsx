import { createFileRoute } from "@tanstack/react-router";
import { ServiceInfoPage } from "@/components/ServiceInfoPage";

export const Route = createFileRoute("/layanan/pjknk")({
  head: () => ({
    meta: [
      { title: "Layanan PJKNK — Persyaratan & Tahapan" },
      { name: "description", content: "Persyaratan, dokumen, dan tahapan pengajuan SKP Penguji K3 Norma Ketenagakerjaan (PJKNK)." },
      { property: "og:title", content: "Layanan PJKNK — Persyaratan & Tahapan" },
      { property: "og:description", content: "Informasi pengajuan baru dan perpanjangan PJKNK termasuk pemeriksaan lapangan." },
    ],
  }),
  component: () => <ServiceInfoPage service="PJKNK" />,
});
