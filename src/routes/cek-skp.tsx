import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Loader2, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { DemoNotice, InfoGrid } from "@/components/common";
import { ToneBadge } from "@/components/application/badges";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REQUEST_LABEL, SERVICE_LABEL } from "@/constants/workflow";
import { fmtDate } from "@/lib/format";
import { searchPublicSkp } from "@/services/store";

export const Route = createFileRoute("/cek-skp")({
  head: () => ({
    meta: [
      { title: "Cek Status SKP — Layanan KNK & PJKNK" },
      { name: "description", content: "Periksa status dan masa berlaku SKP KNK atau PJKNK menggunakan nomor SKP." },
      { property: "og:title", content: "Cek Status SKP KNK & PJKNK" },
      { property: "og:description", content: "Verifikasi nomor SKP yang telah diterbitkan." },
    ],
  }),
  component: CekSkp,
});

type R = Awaited<ReturnType<typeof searchPublicSkp>>;

function CekSkp() {
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "found" | "notfound" | "error">("idle");
  const [res, setRes] = useState<R>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (!v) return setErr("Nomor SKP wajib diisi.");
    if (!/^[A-Z0-9./-]{6,40}$/i.test(v)) return setErr("Format nomor SKP tidak valid. Gunakan huruf, angka, titik, garis miring, atau tanda hubung.");
    setErr("");
    setState("loading");
    try {
      const r = await searchPublicSkp(v);
      setRes(r);
      setState(r ? "found" : "notfound");
    } catch {
      setState("error");
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground">Cek Status SKP</h1>
        <p className="mt-2 text-muted-foreground">Masukkan nomor Surat Keputusan Penunjukan untuk memeriksa status penerbitannya.</p>
        <form onSubmit={submit} className="surface mt-6 p-5" noValidate>
          <Label htmlFor="skp">Nomor SKP</Label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <Input id="skp" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Contoh: DEMO/KNK/0001/2026" className="h-11" aria-invalid={!!err} aria-describedby={err ? "skp-err" : undefined} />
            <Button type="submit" className="h-11" disabled={state === "loading"}>
              {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Cari
            </Button>
          </div>
          {err && (
            <p id="skp-err" className="mt-2 text-sm text-destructive">
              {err}
            </p>
          )}
          <div className="mt-4">
            <DemoNotice>Pencarian menggunakan data ilustrasi. Coba nomor DEMO/KNK/0001/2026 atau DEMO/PJKNK/0012/2026.</DemoNotice>
          </div>
        </form>

        <div className="mt-6" aria-live="polite">
          {state === "loading" && <div className="surface h-40 animate-pulse" />}
          {state === "notfound" && (
            <div className="surface flex gap-3 p-5">
              <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="font-semibold text-foreground">SKP tidak ditemukan</p>
                <p className="text-sm text-muted-foreground">Periksa kembali nomor yang dimasukkan. SKP yang belum selesai ditandatangani tidak ditampilkan.</p>
              </div>
            </div>
          )}
          {state === "error" && <p className="text-sm text-destructive">Terjadi kesalahan saat mencari. Silakan coba lagi.</p>}
          {state === "found" && res && (
            <div className="surface p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <ShieldCheck className="h-5 w-5 text-success" /> {res.nomor}
                </span>
                <ToneBadge tone={res.berlaku ? "success" : "danger"}>{res.berlaku ? "Berlaku" : "Tidak berlaku"}</ToneBadge>
              </div>
              <InfoGrid
                items={[
                  ["Jenis Layanan", SERVICE_LABEL[res.layanan]],
                  ["Jenis Permohonan", REQUEST_LABEL[res.jenis]],
                  ["Perusahaan / Instansi", res.instansi],
                  ["Provinsi", res.provinsi],
                  ["Tanggal Terbit", fmtDate(res.terbit)],
                  ["Berlaku Sampai", fmtDate(res.berlakuSampai)],
                ]}
              />
              <p className="mt-4 text-xs text-muted-foreground">Data pribadi pemegang SKP tidak ditampilkan pada pencarian publik.</p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
