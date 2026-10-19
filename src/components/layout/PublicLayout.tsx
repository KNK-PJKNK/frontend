import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { homeFor, useSessionUser } from "@/services/store";

const NAV = [
  { to: "/", label: "Beranda" },
  { to: "/layanan/knk", label: "Layanan KNK" },
  { to: "/layanan/pjknk", label: "Layanan PJKNK" },
  { to: "/cek-skp", label: "Cek Status SKP" },
] as const;

export function PublicLayout({ children }: { children: ReactNode }) {
  const user = useSessionUser();
  const cta = user ? (
    <Button asChild size="sm">
      <Link to={homeFor(user)}>Ke Dasbor</Link>
    </Button>
  ) : (
    <Button asChild size="sm">
      <Link to="/masuk">Masuk</Link>
    </Button>
  );
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" aria-label="Beranda">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "text-navy bg-secondary" }}>
                {n.label}
              </Link>
            ))}
            <div className="ml-2">{cta}</div>
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="mb-4">Menu</SheetTitle>
              <nav className="flex flex-col gap-1">
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} className="rounded-md px-3 py-3 text-base font-medium hover:bg-muted">
                    {n.label}
                  </Link>
                ))}
                <div className="mt-3">{cta}</div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-navy text-navy-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <BrandMark inverted />
            <p className="mt-3 text-sm text-navy-foreground/70">Layanan pengajuan dan penerbitan Surat Keputusan Penunjukan untuk KNK dan PJKNK.</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Kontak Instansi</p>
            <p className="mt-2 text-navy-foreground/70">[Nama instansi penyelenggara]</p>
            <p className="text-navy-foreground/70">[Alamat kantor]</p>
            <p className="text-navy-foreground/70">[Telepon / email layanan]</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Tautan</p>
            <ul className="mt-2 space-y-1 text-navy-foreground/70">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="hover:text-navy-foreground hover:underline">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-foreground/15 py-4 text-center text-xs text-navy-foreground/60">
          Prototipe sistem — informasi kelembagaan bersifat placeholder hingga disetujui. © 2026
        </div>
      </footer>
    </div>
  );
}
