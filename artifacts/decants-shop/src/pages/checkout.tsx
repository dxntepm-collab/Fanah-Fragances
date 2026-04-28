import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { formatPrice, cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nombre requerido"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().min(6, "Teléfono requerido"),
  shippingMethod: z.enum(["delivery_piura", "shipping_provincia", "pickup"]),
  shippingAddress: z.string().min(5, "Dirección requerida"),
  city: z.string().min(2, "Ciudad requerida"),
  paymentMethod: z.enum(["yape", "plin", "transfer", "cash_on_delivery"]),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const createOrderMutation = useCreateOrder();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingMethod: "delivery_piura",
      shippingAddress: "",
      city: "Piura",
      paymentMethod: "yape",
      notes: "",
    },
  });

  const watchShippingMethod = form.watch("shippingMethod");
  
  // Calculate dynamic shipping cost
  let shippingCost = 0;
  if (watchShippingMethod === "Piura") shippingCost = 1500; // S/ 15.00
  if (watchShippingMethod === "shipping_provincia") shippingCost = 2500; // S/ 25.00

  const onSubmit = (data: CheckoutFormValues) => {
    createOrderMutation.mutate(
      { data },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          setLocation(`/pedido/${order.orderNumber}`);
        }
      }
    );
  };

  if (isCartLoading) return <div className="container mx-auto p-12 text-center">Cargando...</div>;
  if (!cart || cart.items.length === 0) {
    setLocation("/carrito");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif mb-12 text-center md:text-left">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              
              {/* Información de Contacto */}
              <div className="space-y-6">
                <h2 className="text-xl font-serif border-b border-border pb-2 uppercase tracking-widest text-primary">1. Contacto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Juan Pérez" {...field} className="bg-background border-border focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono / Celular</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 987654321" {...field} className="bg-background border-border focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="correo@ejemplo.com" {...field} className="bg-background border-border focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Envío */}
              <div className="space-y-6">
                <h2 className="text-xl font-serif border-b border-border pb-2 uppercase tracking-widest text-primary">2. Entrega</h2>
                
                <FormField
                  control={form.control}
                  name="shippingMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { id: "delivery_piura", label: "Delivery Piura", price: "+ S/ 15.00" },
                            { id: "shipping_provincia", label: "Envío a Provincia", price: "+ S/ 25.00" },
                            { id: "pickup", label: "Recojo (consultar)", price: "Gratis" }
                          ].map(opt => (
                            <label 
                              key={opt.id}
                              className={cn(
                                "border p-4 cursor-pointer transition-colors relative",
                                field.value === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                              )}
                            >
                              <input 
                                type="radio" 
                                className="sr-only" 
                                value={opt.id}
                                checked={field.value === opt.id}
                                onChange={field.onChange}
                              />
                              <span className="block font-medium mb-1">{opt.label}</span>
                              <span className="block text-xs text-muted-foreground">{opt.price}</span>
                              {field.value === opt.id && (
                                <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full" />
                              )}
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchShippingMethod !== "pickup" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Dirección de Envío</FormLabel>
                          <FormControl>
                            <Input placeholder="Av. Principal 123, Dpto 4" {...field} className="bg-background border-border focus-visible:ring-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad / Distrito</FormLabel>
                          <FormControl>
                            <Input placeholder="Miraflores, Lima" {...field} className="bg-background border-border focus-visible:ring-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Pago */}
              <div className="space-y-6">
                <h2 className="text-xl font-serif border-b border-border pb-2 uppercase tracking-widest text-primary">3. Pago</h2>
                <p className="text-sm text-muted-foreground mb-4">Selecciona cómo deseas pagar. Los detalles se te mostrarán al finalizar el pedido.</p>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: "yape", label: "Yape" },
                            { id: "plin", label: "Plin" },
                            { id: "transfer", label: "Transferencia BCP/IBK" },
                            { id: "cash_on_delivery", label: "Contraentrega (Piura)" }
                          ].map(opt => {
                            if (opt.id === "cash_on_delivery" && watchShippingMethod === "shipping_provincia") return null;
                            
                            return (
                              <label 
                                key={opt.id}
                                className={cn(
                                  "border p-4 cursor-pointer transition-colors relative flex items-center gap-3",
                                  field.value === opt.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                                )}
                              >
                                <input 
                                  type="radio" 
                                  className="sr-only" 
                                  value={opt.id}
                                  checked={field.value === opt.id}
                                  onChange={field.onChange}
                                />
                                <div className={cn(
                                  "w-4 h-4 border rounded-full flex items-center justify-center shrink-0",
                                  field.value === opt.id ? "border-primary" : "border-border"
                                )}>
                                  {field.value === opt.id && <div className="w-2 h-2 bg-primary rounded-full" />}
                                </div>
                                <span className="font-medium text-sm md:text-base">{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 border-t border-border">
                 <button 
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-primary text-primary-foreground py-5 uppercase tracking-widest font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createOrderMutation.isPending ? "Procesando..." : "Confirmar Pedido"}
                </button>
              </div>

            </form>
          </Form>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-card/50 border border-border p-6 md:p-8 sticky top-24">
            <h2 className="font-serif text-2xl mb-6">Tu Pedido</h2>
            
            <div className="space-y-4 mb-6 pb-6 border-b border-border/50 max-h-[40vh] overflow-y-auto pr-2">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-card border border-border/50 shrink-0">
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover mix-blend-screen" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center text-sm">
                    <span className="font-medium text-foreground truncate">{item.productName}</span>
                    <span className="text-xs text-muted-foreground">{item.sizeMl}ml x {item.quantity}</span>
                    <span className="text-primary mt-1">{formatPrice(item.lineTotalCents)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm mb-6 border-b border-border/50 pb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cart.subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-serif">
              <span>Total</span>
              <span className="text-primary">{formatPrice(cart.subtotalCents + shippingCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
