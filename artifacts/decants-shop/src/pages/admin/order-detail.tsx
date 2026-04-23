import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { Loader2, ArrowLeft } from "lucide-react";

type Order = Awaited<ReturnType<typeof adminApi.order>>;

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

const SHIPPING_LABELS: Record<string, string> = {
  delivery_lima: "Delivery Lima",
  shipping_provincia: "Envío a provincia",
  pickup: "Recojo en tienda",
};

const PAYMENT_LABELS: Record<string, string> = {
  yape: "Yape",
  plin: "Plin",
  transfer: "Transferencia bancaria",
  cash_on_delivery: "Contraentrega",
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const orderId = Number(id);
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = () => adminApi.order(orderId).then(setOrder);
  useEffect(() => {
    load();
  }, [orderId]);

  const setStatus = async (status: string) => {
    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(orderId, status);
      await load();
    } finally {
      setUpdating(false);
    }
  };

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-10">
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A961]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-10 max-w-4xl">
        <Link href="/admin/pedidos" className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Volver a pedidos
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-neutral-500">Pedido</div>
            <h1 className="text-2xl font-serif text-[#C9A961]">{order.orderNumber}</h1>
            <div className="text-xs text-neutral-500 mt-1">
              {new Date(order.createdAt).toLocaleString("es-PE")}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-neutral-500">Estado:</span>
            <select
              value={order.status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={updating}
              className="bg-black border border-[#C9A961] text-[#C9A961] px-3 py-2 text-sm focus:outline-none"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <Card title="Cliente">
            <Field label="Nombre" value={order.customerName} />
            <Field label="Email" value={order.customerEmail} />
            <Field label="Teléfono" value={order.customerPhone} />
          </Card>
          <Card title="Envío">
            <Field label="Método" value={SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod} />
            <Field label="Ciudad" value={order.city} />
            <Field label="Dirección" value={order.shippingAddress} />
          </Card>
          <Card title="Pago">
            <Field label="Método" value={PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod} />
          </Card>
          {order.notes && (
            <Card title="Notas">
              <p className="text-sm text-neutral-300">{order.notes}</p>
            </Card>
          )}
        </div>

        <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">Productos</h2>
        <table className="w-full text-sm mb-8">
          <thead className="text-xs uppercase tracking-wider text-neutral-500">
            <tr className="border-b border-white/10">
              <th className="text-left py-2">Producto</th>
              <th className="text-left">Tamaño</th>
              <th className="text-right">Precio</th>
              <th className="text-right">Cantidad</th>
              <th className="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} className="border-b border-white/5">
                <td className="py-3 text-neutral-200">
                  {i.productName}
                  <div className="text-xs text-neutral-500">{i.brand}</div>
                </td>
                <td className="text-neutral-400">{i.sizeMl} ml</td>
                <td className="text-right text-neutral-400">{formatPrice(i.unitPriceCents)}</td>
                <td className="text-right text-neutral-400">{i.quantity}</td>
                <td className="text-right text-neutral-200">{formatPrice(i.lineTotalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto w-64 text-sm space-y-2">
          <div className="flex justify-between text-neutral-400">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Envío</span>
            <span>{formatPrice(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between text-[#C9A961] text-lg font-serif border-t border-white/10 pt-2">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 p-5">
      <div className="text-xs uppercase tracking-widest text-neutral-500 mb-3">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-neutral-500">{label}: </span>
      <span className="text-neutral-200">{value}</span>
    </div>
  );
}
