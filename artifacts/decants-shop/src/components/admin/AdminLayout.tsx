import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { adminApi } from "@/lib/admin-api";
import { LayoutDashboard, Package, Tag, ShoppingBag, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/admin", label: "Resumen", icon: LayoutDashboard },
  { path: "/admin/productos", label: "Perfumes", icon: Package },
  { path: "/admin/marcas", label: "Marcas", icon: Tag },
  { path: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    adminApi
      .session()
      .then((s) => {
        if (!s.authenticated) setLocation("/admin/login");
        else setChecking(false);
      })
      .catch(() => setLocation("/admin/login"));
  }, [setLocation]);

  const handleLogout = async () => {
    await adminApi.logout();
    setLocation("/admin/login");
  };

  if (checking) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-black text-[#C9A961]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex bg-black text-neutral-200">
      <aside className="w-60 border-r border-white/10 flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="text-xs tracking-[0.3em] text-[#C9A961]">FANAH</div>
          <div className="text-sm text-neutral-400 mt-1">Admin</div>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const active =
              item.path === "/admin"
                ? location === "/admin"
                : location.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-sm transition-colors",
                  active
                    ? "bg-white/5 text-[#C9A961] border-l-2 border-[#C9A961]"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 space-y-2">
          <Link
            href="/"
            className="block text-xs text-neutral-500 hover:text-neutral-300 px-2"
          >
            ← Ver tienda
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-2 py-1 text-xs text-neutral-500 hover:text-neutral-300"
          >
            <LogOut className="w-3 h-3" /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
