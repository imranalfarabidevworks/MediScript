"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Activity,
  Stethoscope,
  ShieldCheck,
  ChevronRight,
  HeartPulse,
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

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0f1e] border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
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
              onClick={() => router.push(item.href)}
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
  );
}
