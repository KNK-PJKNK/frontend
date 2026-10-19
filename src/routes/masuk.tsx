import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BrandMark, DemoNotice } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_PASSWORD, DEMO_USERS } from "@/services/mock-data";
import { homeFor, login } from "@/services/store";

export const Route = createFileRoute("/masuk")({
  head: () => ({
    meta: [
      { title: "Masuk — Sistem Layanan KNK & PJKNK" },
      { name: "description", content: "Masuk untuk mengajukan, memantau, atau memproses permohonan KNK dan PJKNK." },
      { property: "og:title", content: "Masuk — Sistem Layanan KNK & PJKNK" },
      { property: "og:description", content: "Akses dasbor pemohon dan tim kerja." },
    ],
  }),
  component: Masuk,
});

const schema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi.").email("Format email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});
type F = z.infer<typeof schema>;

const ROLE = { pemohon: "Pemohon", petugas: "Tim Kerja / Admin", pejabat: "Pejabat Berwenang" };

function Masuk() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const { register, handleSubmit, setValue, formState } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (v: F) => {
    setAuthErr("");
    try {
      const u = await login(v.email, v.password);
      navigate({ to: homeFor(u) });
    } catch (e) {
      setAuthErr(e instanceof Error ? e.message : "Gagal masuk.");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-hero hidden flex-col justify-between p-10 text-navy-foreground lg:flex">
        <Link to="/">
          <BrandMark inverted />
        </Link>
        <div>
          <h2 className="text-3xl font-bold">Satu sistem untuk seluruh proses layanan.</h2>
          <p className="mt-3 max-w-md text-navy-foreground/80">Dari pengajuan, verifikasi dokumen, pemeriksaan lapangan, persetujuan, hingga penyampaian SKP.</p>
        </div>
        <p className="text-xs text-navy-foreground/60">Prototipe — © 2026</p>
      </div>
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 block lg:hidden">
            <BrandMark />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Masuk</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gunakan akun yang terdaftar pada layanan.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" className="mt-1.5 h-11" aria-invalid={!!formState.errors.email} {...register("email")} />
              {formState.errors.email && <p className="mt-1 text-sm text-destructive">{formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" className="h-11 pr-11" aria-invalid={!!formState.errors.password} {...register("password")} />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formState.errors.password && <p className="mt-1 text-sm text-destructive">{formState.errors.password.message}</p>}
            </div>
            {authErr && (
              <p role="alert" className="rounded-md border border-destructive/30 bg-danger-soft px-3 py-2 text-sm text-destructive">
                {authErr}
              </p>
            )}
            <Button type="submit" className="h-11 w-full" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Masuk
            </Button>
          </form>

          <div className="mt-8 space-y-3">
            <DemoNotice>Akun demo — kata sandi: {DEMO_PASSWORD}. Pilih peran untuk mengisi otomatis.</DemoNotice>
            <div className="grid gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setValue("email", u.email);
                    setValue("password", DEMO_PASSWORD);
                  }}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:border-primary/50 hover:bg-muted"
                >
                  <span>
                    <span className="block font-medium text-foreground">{ROLE[u.role]}</span>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </span>
                  <span className="text-xs text-primary">Gunakan</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
