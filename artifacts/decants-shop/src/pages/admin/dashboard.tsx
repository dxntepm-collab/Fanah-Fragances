import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { Loader2, Package, Tag, ShoppingBag } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function AdminDashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminApi.dashboard>> | null>(null);

  useEffect(() => {
    adminApi.dashboard().then(setData).catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <div className="p-10 max-w-6xl">
        <h1 className="text-2xl font-serif text-[#C9A961] mb-8">Resumen</h1>
        {!data ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A961]" />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-10">
              <Stat icon={Package} label="Perfumes" value={data.totals.products} />
              <Stat icon={Tag} label="Marcas" value={data.totals.brands} />
              <Stat icon={ShoppingBag} label="Pedidos" value={data.totals.orders} />
            </div>

            <section className="mb-10">
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                Pedidos por estado
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.ordersByStatus.length === 0 && (
                  <span className="text-sm text-neutral-500">Sin pedidos aún</span>
                )}
                {data.ordersByStatus.map((s) => (
                  <div
                    key={s.status}
                    className="border border-white/10 px-4 py-2 text-sm"
                  >
                    <span className="text-[#C9A961]">{STATUS_LABELS[s.status] ?? s.status}</span>
                    <span className="text-neutral-400 ml-3">{s.count}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                Pedidos recientes
              </h2>
              {data.recentOrders.length === 0 ? (
                <p className="text-sm text-neutral-500">Aún no hay pedidos.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wider text-neutral-500">
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3">Pedido</th>
                      <th className="text-left">Cliente</th>
                      <th className="text-left">Estado</th>
                      <th className="text-right">Total</th>
                      <th className="text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((o) => (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3">
                          <Link
                            href={`/admin/pedidos/${o.id}`}
                            className="text-[#C9A961] hover:underline"
                          >
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="text-neutral-300">{o.customerName}</td>
                        <td className="text-neutral-400">{STATUS_LABELS[o.status] ?? o.status}</td>
                        <td className="text-right text-neutral-200">{formatPrice(o.totalCents)}</td>
                        <td className="text-right text-neutral-500 text-xs">
                          {new Date(o.createdAt).toLocaleDateString("es-PE")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="border border-white/10 p-6">
      <Icon className="w-5 h-5 text-[#C9A961] mb-3" />
      <div className="text-3xl font-serif text-neutral-100">{value}</div>
      <div className="text-xs uppercase tracking-wider text-neutral-500 mt-1">{label}</div>
    </div>
  );
}
