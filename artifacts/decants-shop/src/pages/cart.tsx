import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function CartPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart();
  
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();

  const handleUpdateQuantity = (itemId: number, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;
    
    updateItemMutation.mutate(
      { itemId, data: { quantity: newQuantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        }
      }
    );
  };

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate(
      { itemId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <h1 className="text-4xl font-serif mb-12">Tu Carrito</h1>
        <div className="h-64 bg-card border border-border mb-8"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-xl">
        <ShoppingBag size={48} className="mx-auto mb-6 text-muted-foreground opacity-50" strokeWidth={1} />
        <h1 className="text-4xl font-serif mb-4">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-8">Parece que aún no has seleccionado ninguna fragancia. Descubre nuestra colección de decants.</p>
        <Link href="/catalogo" className="bg-primary text-primary-foreground px-8 py-4 uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors inline-block">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif mb-12">Tu Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
            <div className="col-span-6">Producto</div>
            <div className="col-span-2 text-center">Precio</div>
            <div className="col-span-2 text-center">Cantidad</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {cart.items.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-border/50">
              {/* Product Info */}
              <div className="md:col-span-6 flex gap-4">
                <Link href={`/perfume/${item.productSlug}`} className="w-20 h-24 shrink-0 bg-card border border-border/50 overflow-hidden block">
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover mix-blend-screen" />
                </Link>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] tracking-widest uppercase text-muted-foreground">{item.brand}</span>
                  <Link href={`/perfume/${item.productSlug}`} className="font-serif text-lg hover:text-primary transition-colors">
                    {item.productName}
                  </Link>
                  <span className="text-sm text-muted-foreground mt-1">Decant {item.sizeMl}ml</span>
                  
                  {/* Mobile only elements */}
                  <div className="md:hidden mt-3 flex items-center justify-between">
                    <span className="text-primary">{formatPrice(item.unitPriceCents)}</span>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-xs uppercase text-muted-foreground hover:text-destructive flex items-center gap-1">
                      <X size={12}/> Eliminar
                    </button>
                  </div>
                </div>
              </div>

              {/* Price (Desktop) */}
              <div className="hidden md:block md:col-span-2 text-center text-muted-foreground">
                {formatPrice(item.unitPriceCents)}
              </div>

              {/* Quantity */}
              <div className="md:col-span-2 flex justify-start md:justify-center">
                <div className="flex items-center border border-border h-10 w-28">
                  <button 
                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                    disabled={updateItemMutation.isPending || item.quantity <= 1}
                    className="flex-1 h-full flex items-center justify-center hover:text-primary transition-colors text-muted-foreground disabled:opacity-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                    disabled={updateItemMutation.isPending}
                    className="flex-1 h-full flex items-center justify-center hover:text-primary transition-colors text-muted-foreground disabled:opacity-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Total & Remove (Desktop) */}
              <div className="hidden md:flex md:col-span-2 justify-end items-center gap-4">
                <span className="font-medium text-primary">{formatPrice(item.lineTotalCents)}</span>
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removeItemMutation.isPending}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card/50 border border-border p-8 sticky top-24">
            <h2 className="font-serif text-2xl mb-6">Resumen</h2>
            
            <div className="space-y-4 text-sm mb-6 border-b border-border/50 pb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                <span>{formatPrice(cart.subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className="italic text-muted-foreground">Calculado en pago</span>
              </div>
            </div>
            
            <div className="flex justify-between text-xl font-serif mb-8">
              <span>Total Estimado</span>
              <span className="text-primary">{formatPrice(cart.subtotalCents)}</span>
            </div>
            
            <button 
              onClick={() => setLocation("/checkout")}
              className="w-full bg-primary text-primary-foreground py-4 uppercase tracking-widest text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Proceder al Pago
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
              <span>Pagos seguros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
