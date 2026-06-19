"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  Stethoscope,
  ShieldCheck,
  ChevronRight,
  HeartPulse,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    label: "Patient Portal",
    href: "/patient",
    icon: HeartPulse,
    color: "text-emerald-400",
    activeBg: "bg-emerald-500/10 border-emerald-500/30",
    badge: "green",
  },
  {
    label: "Doctor Portal",
    href: "/doctor",
    icon: Stethoscope,
    color: "text-sky-400",
    activeBg: "bg-sky-500/10 border-sky-500/30",
    badge: "blue",
  },
  {
    label: "Admin Portal",
    href: "/admin",
    icon: ShieldCheck,
    color: "text-rose-400",
    activeBg: "bg-rose-500/10 border-rose-500/30",
    badge: "red",
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (href: string) => {
    router.push(href);
    setMobileOpen(false); // auto-close drawer on mobile after navigating
  };

  return (
    <>
      {/* Mobile top bar — visible only below md breakpoint */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0f1e] border-b border-white/5 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <p className="font-bold text-white text-sm tracking-wide">MediScript</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-white/5 text-white/70"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Backdrop — closes drawer when tapped */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar:
          - Mobile: fixed off-canvas drawer that slides in from the left
          - Desktop (md+): always-visible fixed sidebar, original behavior */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-[#0a0f1e] border-r border-white/5 flex flex-col z-50 transition-transform duration-300",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm tracking-wide">
                MediScript
              </p>
              <p className="text-[10px] text-white/30 tracking-widest uppercase">
                Health Analytics
              </p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/50"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] text-white/20 tracking-widest uppercase px-3 mb-3">
            Portals
          </p>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? `${item.activeBg} border-opacity-100`
                    : "border-transparent hover:bg-white/5 hover:border-white/10"
                )}
              >
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 transition-colors",
                    isActive ? item.color : "text-white/30 group-hover:text-white/60"
                  )}
                />
                <span
                  className={cn(
                    "flex-1 text-left",
                    isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight className={cn("w-3.5 h-3.5", item.color)} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="px-3 py-2">
            <p className="text-[10px] text-white/20">
              AI-Powered Health Records v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}