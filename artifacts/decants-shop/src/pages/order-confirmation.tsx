import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const { toast } = useToast();
  const { data: order, isLoading } = useGetOrder(orderNumber!, {
    query: { enabled: !!orderNumber, queryKey: getGetOrderQueryKey(orderNumber!) }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Número de pedido copiado al portapapeles.",
    });
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-24 text-center">Cargando detalles de tu pedido...</div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif mb-4">Pedido no encontrado</h1>
        <p className="text-muted-foreground mb-8">No pudimos encontrar el pedido {orderNumber}.</p>
        <Link href="/" className="text-primary hover:underline uppercase tracking-widest text-sm">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-3xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif mb-4">¡Pedido Confirmado!</h1>
        <p className="text-muted-foreground text-lg">
          Gracias por tu compra, {order.customerName.split(' ')[0]}. Hemos recibido tu pedido.
        </p>
      </div>

      <div className="bg-card border border-border p-6 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 mb-6 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Número de Pedido</p>
            <div className="flex items-center gap-2 text-2xl font-serif text-primary">
              {order.orderNumber}
              <button onClick={() => copyToClipboard(order.orderNumber)} className="text-muted-foreground hover:text-foreground">
                <Copy size={16} />
              </button>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Fecha</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Payment Instructions based on method */}
        {order.status === "pending" && (
          <div className="bg-primary/5 border border-primary/20 p-6 mb-8 text-sm">
            <h3 className="font-serif text-lg text-primary mb-3">Instrucciones de Pago</h3>
            
            {order.paymentMethod === "yape" && (
              <div>
                <p className="mb-2">Por favor, realiza el Yape por <strong>{formatPrice(order.totalCents)}</strong> al número:</p>
                <p className="text-xl font-bold mb-2">999 888 777 (FANAH Fragrances)</p>
                <p className="text-muted-foreground">Envía la captura de pantalla por WhatsApp indicando tu número de pedido ({order.orderNumber}).</p>
              </div>
            )}
            
            {order.paymentMethod === "plin" && (
              <div>
                <p className="mb-2">Por favor, realiza el Plin por <strong>{formatPrice(order.totalCents)}</strong> al número:</p>
                <p className="text-xl font-bold mb-2">999 888 777 (FANAH Fragrances)</p>
                <p className="text-muted-foreground">Envía la captura de pantalla por WhatsApp indicando tu número de pedido ({order.orderNumber}).</p>
              </div>
            )}
            
            {order.paymentMethod === "transfer" && (
              <div>
                <p className="mb-2">Realiza la transferencia por <strong>{formatPrice(order.totalCents)}</strong> a la siguiente cuenta BCP:</p>
                <p className="font-mono mb-1">Cuenta: 194-12345678-0-99</p>
                <p className="font-mono mb-3">CCI: 002-194-12345678099-11</p>
                <p className="text-muted-foreground">Envía la constancia al correo lujoembotellado@gmail.com o por WhatsApp.</p>
              </div>
            )}
            
            {order.paymentMethod === "cash_on_delivery" && (
              <div>
                <p>Has seleccionado pago contraentrega. Pagarás <strong>{formatPrice(order.totalCents)}</strong> al momento de recibir tus decants.</p>
                <p className="text-muted-foreground mt-2">Nuestro repartidor se comunicará contigo antes de llegar.</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Resumen de Artículos</h3>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
              <div className="flex gap-4 items-center">
                <img src={item.imageUrl} alt={item.productName} className="w-12 h-16 object-cover bg-card mix-blend-screen" />
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.brand} • {item.sizeMl}ml x {item.quantity}</p>
                </div>
              </div>
              <div className="font-medium">
                {formatPrice(item.lineTotalCents)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border space-y-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Envío ({order.shippingMethod.replace('_', ' ')})</span>
            <span>{order.shippingCents === 0 ? "Gratis" : formatPrice(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between text-lg font-serif pt-3 border-t border-border/50 text-primary">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/catalogo" className="border border-border px-8 py-4 uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors inline-block">
          Seguir Comprando
        </Link>
      </div>
    </div>
  );
}
