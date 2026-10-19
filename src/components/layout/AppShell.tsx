import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ClipboardCheck,
  FilePlus2,
  FileSearch,
  FileSignature,
  History,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  PackageCheck,
  RotateCcw,
  Stamp,
} from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { fmtDateTime } from "@/lib/format";
import { api, logout, useDB, useSessionUser } from "@/services/store";
import type { Role } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Bell;
  exact?: boolean;
}

const NAV: Record<Role, NavItem[]> = {
  pemohon: [
    { to: "/pemohon", label: "Dasbor", icon: LayoutDashboard, exact: true },
    { to: "/pemohon/ajukan", label: "Buat Pengajuan", icon: FilePlus2 },
    { to: "/pemohon/riwayat", label: "Riwayat Pengajuan", icon: History },
  ],
  petugas: [
    { to: "/admin", label: "Dasbor Kerja", icon: LayoutDashboard, exact: true },
    { to: "/admin/pengajuan", label: "Pencarian & Verifikasi", icon: FileSearch },
    { to: "/admin/lapangan", label: "Pemeriksaan Lapangan", icon: MapPinned },
    { to: "/admin/persetujuan", label: "Review & Persetujuan", icon: Stamp },
    { to: "/admin/penerbitan", label: "Penerbitan SKP & TTE", icon: FileSignature },
    { to: "/admin/finalisasi", label: "Finalisasi", icon: PackageCheck },
  ],
  pejabat: [
    { to: "/admin", label: "Dasbor Kerja", icon: LayoutDashboard, exact: true },
    { to: "/admin/persetujuan", label: "Review & Persetujuan", icon: Stamp },
    { to: "/admin/pengajuan", label: "Pencarian Pengajuan", icon: FileSearch },
  ],
};

const ROLE_LABEL: Record<Role, string> = { pemohon: "Pemohon", petugas: "Tim Kerja", pejabat: "Pejabat Berwenang" };

function SideNav({ role }: { role: Role }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Navigasi aplikasi">
      {NAV[role].map((n) => (
        <Link
          key={n.to}
          to={n.to}
          activeOptions={{ exact: !!n.exact }}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
        >
          <n.icon className="h-4 w-4" aria-hidden />
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

function Notifications() {
  const db = useDB();
  const user = useSessionUser();
  const items = db.notifications.filter((n) => n.userId === user?.id);
  const unread = items.filter((n) => !n.read).length;
  return (
    <Popover onOpenChange={(o) => !o && unread && api.markNotificationsRead()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifikasi, ${unread} belum dibaca`}>
          <Bell className="h-5 w-5" />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <p className="border-b px-4 py-3 text-sm font-semibold">Notifikasi</p>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Belum ada notifikasi.</p>
        ) : (
          <ul className="max-h-80 overflow-auto">
            {items.slice(0, 10).map((n) => (
              <li key={n.id} className="border-b last:border-0">
                <div className="block px-4 py-3">
                  <p className="text-sm text-foreground">
                    {!n.read && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-primary" aria-label="Belum dibaca" />}
                    {n.text}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{fmtDateTime(n.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const user = useSessionUser();
  const navigate = useNavigate();
  if (!user) return null;
  const doLogout = () => {
    logout();
    navigate({ to: "/masuk", replace: true });
  };
  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar p-4">
      <Link to="/" className="mb-6 px-1">
        <BrandMark inverted />
      </Link>
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">{ROLE_LABEL[user.role]}</p>
      <SideNav role={user.role} />
      <div className="mt-auto rounded-md border border-sidebar-border p-3 text-xs text-sidebar-foreground/80">
        <p className="font-semibold text-sidebar-accent-foreground">Mode Prototipe</p>
        <p className="mt-1">Data ilustrasi. Integrasi backend, penyimpanan berkas, dan TTE resmi belum terhubung.</p>
      </div>
    </div>
  );
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-card px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-0 p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                {sidebar}
              </SheetContent>
            </Sheet>
            <span className="hidden text-sm text-muted-foreground sm:inline">Sistem Layanan KNK & PJKNK 2026</span>
          </div>
          <div className="flex items-center gap-2">
            {user.role === "pemohon" && <Notifications />}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.unit ?? ROLE_LABEL[user.role]}</p>
            </div>
            <Button variant="outline" size="sm" onClick={doLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export const shellIcons = { ClipboardCheck, RotateCcw };
