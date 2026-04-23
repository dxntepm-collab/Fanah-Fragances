import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Order = Awaited<ReturnType<typeof adminApi.orders>>[number];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const PAYMENT_LABELS: Record<string, string> = {
  yape: "Yape",
  plin: "Plin",
  transfer: "Transferencia",
  cash_on_delivery: "Contraentrega",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    adminApi.orders().then(setOrders);
  }, []);

  const filtered = orders?.filter((o) => filter === "all" || o.status === filter) ?? [];

  return (
    <AdminLayout>
      <div className="p-10">
        <h1 className="text-2xl font-serif text-[#C9A961] mb-6">Pedidos</h1>

        <div className="flex gap-2 mb-6">
          {[["all", "Todos"], ...Object.entries(STATUS_LABELS)].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-3 py-1 text-xs uppercase tracking-wider border ${
                filter === v
                  ? "border-[#C9A961] text-[#C9A961]"
                  : "border-white/10 text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {!orders ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A961]" />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay pedidos.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-neutral-500">
              <tr className="border-b border-white/10">
                <th className="text-left py-3">Pedido</th>
                <th className="text-left">Cliente</th>
                <th className="text-left">Ciudad</th>
                <th className="text-left">Pago</th>
                <th className="text-left">Estado</th>
                <th className="text-right">Total</th>
                <th className="text-right">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3">
                    <Link href={`/admin/pedidos/${o.id}`} className="text-[#C9A961] hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="text-neutral-200">
                    {o.customerName}
                    <div className="text-xs text-neutral-500">{o.customerEmail}</div>
                  </td>
                  <td className="text-neutral-400">{o.city}</td>
                  <td className="text-neutral-400">{PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}</td>
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
      </div>
    </AdminLayout>
  );
}
