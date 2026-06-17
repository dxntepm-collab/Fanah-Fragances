import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Copy, Truck, Phone, Mail, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

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

  // Si el método de pago es Yape, mostrar instrucciones de pago
  if (order.paymentMethod === "yape") {
    return (
      <div className="min-h-screen pt-20 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-8 animate-pulse">
              <Phone size={40} strokeWidth={1.5} />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif mb-4 text-foreground">Pedido Recibido</h1>
            <p className="text-xl md:text-2xl font-serif text-primary mb-6">Completa tu Pago</p>
            
            <div className="space-y-4 text-lg text-muted-foreground mb-8">
              <p>Tu pedido #{order.orderNumber} ha sido registrado exitosamente.</p>
              <p>Por favor, realiza el pago por Yape para continuar con la entrega de tu pedido.</p>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur border border-border p-8 rounded-lg mb-8 space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-6 rounded-lg">
              <h3 className="font-serif text-lg text-primary mb-4">Detalles de Pago Yape</h3>
              
              <div className="space-y-3 text-sm">
                <p>Monto a pagar: <span className="font-semibold text-foreground text-lg">{formatPrice(order.totalCents)}</span></p>
                
                {/* QR Placeholder */}
                <div className="bg-foreground/5 p-6 rounded border border-border/50 flex flex-col items-center gap-4">
                  <div className="w-48 h-48 bg-white rounded flex items-center justify-center">
                    <div className="text-center text-muted-foreground text-xs">
                      <p className="font-bold mb-2">QR YAPE</p>
                      <p className="text-xs">[Escanea este código con tu app de Yape]</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-foreground/5 p-4 rounded border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">O envía tu Yape a:</p>
                  <p className="text-2xl font-bold text-foreground">999 888 777</p>
                  <p className="text-xs text-muted-foreground mt-2">FANAH Fragrances</p>
                </div>
                
                <p className="text-muted-foreground font-medium">📸 Después de pagar:</p>
                <p className="text-muted-foreground">1. Envía la captura de pantalla por WhatsApp al <span className="font-semibold">+51 999 888 777</span></p>
                <p className="text-muted-foreground">2. Menciona tu pedido <span className="font-semibold">#{order.orderNumber}</span></p>
                <p className="text-muted-foreground">3. Recibirás confirmación en menos de 24 horas</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Una vez confirmemos tu pago, recibirás un correo de confirmación y nos pondremos en contacto contigo para coordinar la entrega.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/catalogo" 
              className="border border-border px-8 py-4 uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors inline-block"
            >
              Volver a Comprar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Para contraentrega, mostrar la página de confirmación inmediatamente

  return (
    <div className="min-h-screen pt-20 pb-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Section */}
        <div className="text-center mb-16 animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-8 animate-bounce">
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif mb-2 text-foreground">¡Gracias!</h1>
          <p className="text-2xl md:text-3xl font-serif text-primary mb-4">Tu Compra ha sido Confirmada</p>
          
          <div className="space-y-3 text-lg text-muted-foreground mb-8">
            <p>Hola <span className="font-semibold text-foreground">{order.customerName.split(' ')[0]}</span>,</p>
            <p>Hemos recibido tu pedido con éxito. Nos encantará preparar tus decants seleccionados.</p>
            <p className="text-base pt-2">
              <span className="inline-flex items-center gap-2 text-primary font-medium">
                <Heart size={16} fill="currentColor" /> Nos estaremos contactando pronto para coordinar la entrega de tu pedido
              </span>
            </p>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-card/50 backdrop-blur border border-border p-8 rounded-lg mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-border/50">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Número de Pedido</p>
              <button
                onClick={() => copyToClipboard(order.orderNumber)}
                className="group flex items-center gap-2 text-2xl font-serif text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                {order.orderNumber}
                <Copy size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Fecha</p>
              <p className="font-medium text-lg">
                {new Date(order.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-foreground/5 border border-border/50 p-6 rounded-lg mb-8">
            <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
              <Truck size={20} className="text-primary" /> Información de Envío
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Dirección:</span> {order.shippingAddress}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Método:</span> {order.shippingMethod === "delivery_piura" ? "Delivery (Piura)" : order.shippingMethod === "shipping_provincia" ? "Envío a Provincia" : "Recojo"}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Contacto:</span> {order.customerPhone}
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="mb-8">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6 font-semibold">Tu Selección</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 pb-4 border-b border-border/30 last:border-0 animate-in fade-in slide-in-from-left duration-500 delay-200"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="w-16 h-20 rounded overflow-hidden bg-card border border-border/50 shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.productName} 
                      className="w-full h-full object-cover mix-blend-screen hover:scale-105 transition-transform" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.brand} • {item.sizeMl}ml</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Cantidad: <span className="font-semibold">{item.quantity}</span></span>
                      <span className="font-semibold text-primary">{formatPrice(item.lineTotalCents)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="border-t border-border pt-6 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Envío</span>
              <span>{order.shippingCents === 0 ? "Gratis" : formatPrice(order.shippingCents)}</span>
            </div>
            <div className="flex justify-between text-xl font-serif pt-4 border-t border-border/50 text-primary">
              <span>Total</span>
              <span>{formatPrice(order.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg mb-8 text-center animate-in fade-in duration-500 delay-200">
          <h3 className="font-serif text-lg text-foreground mb-4">¿Preguntas o Dudas?</h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <Mail size={16} /> lujoembotellado@gmail.com
            </p>
            <p className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <Phone size={16} /> +51 999 888 777
            </p>
            <p className="text-xs text-muted-foreground mt-4">Disponibles de lunes a domingo, 9:00 AM - 8:00 PM</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-in fade-in duration-500 delay-300">
          <Link 
            href="/" 
            className="flex-1 bg-primary text-primary-foreground py-4 uppercase tracking-widest font-medium hover:bg-primary/90 transition-colors rounded text-center text-sm"
          >
            Volver al Inicio
          </Link>
          <Link 
            href="/catalogo" 
            className="flex-1 border border-border text-foreground py-4 uppercase tracking-widest font-medium hover:border-primary hover:text-primary transition-colors rounded text-center text-sm"
          >
            Seguir Comprando
          </Link>
        </div>

        {/* Closing Message */}
        <div className="text-center space-y-4 text-muted-foreground animate-in fade-in duration-500 delay-400">
          <p className="italic text-lg">✨ Gracias por tu confianza ✨</p>
          <p className="text-sm leading-relaxed">
            Estamos preparando tu pedido con sumo cuidado y dedicación. Pronto nos comunicaremos contigo para confirmar todos los detalles de la entrega y asegurarnos de que recibas tus fragancias en perfecto estado. ¡Esperamos que disfrutes cada decant!
          </p>
        </div>
      </div>
    </div>
  );
}
