import { useGetProductBySlug, useAddCartItem, getGetCartQueryKey, getGetProductBySlugQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { useParams, Link } from "wouter";
import { useState, useRef } from "react";
import { formatPrice, cn } from "@/lib/utils";
import { Minus, Plus, ShoppingBag, Droplet, Clock, Wind, ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: product, isLoading } = useGetProductBySlug(slug!, {
    query: { enabled: !!slug, queryKey: getGetProductBySlugQueryKey(slug!) }
  });

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const addCartItemMutation = useAddCartItem();

  // Set default variant when product loads
  if (product && !selectedVariantId && product.variants.length > 0) {
    setSelectedVariantId(product.variants[0].id);
  }

  const selectedVariant = product?.variants.find(v => v.id === selectedVariantId);

  const handleAddToCart = () => {
    if (!selectedVariantId) return;
    
    addCartItemMutation.mutate(
      { data: { variantId: selectedVariantId, quantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({
            title: "Agregado al carrito",
            description: `${quantity}x ${product?.name} (${selectedVariant?.sizeMl}ml)`,
            className: "bg-background border-primary text-foreground",
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-card border border-border"></div>
          <div className="space-y-6">
            <div className="h-4 bg-card w-1/4"></div>
            <div className="h-10 bg-card w-3/4"></div>
            <div className="h-6 bg-card w-1/3"></div>
            <div className="h-32 bg-card w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-serif mb-4">Perfume no encontrado</h1>
        <Link href="/catalogo" className="text-primary hover:underline uppercase tracking-widest text-sm">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/catalogo" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs uppercase tracking-widest mb-8">
        <ArrowLeft size={14} /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-24">
        {/* Product Image */}
        <div className="relative aspect-[3/4] border border-border/50 bg-card/20 overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover mix-blend-screen"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <span className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-2 block">
              {product.brand}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl text-primary font-medium">
              {selectedVariant ? formatPrice(selectedVariant.priceCents) : formatPrice(product.fromPriceCents)}
            </p>
          </div>

          <p className="text-muted-foreground font-light leading-relaxed mb-10 text-lg">
            {product.description}
          </p>

          {/* Size Selector */}
          <div className="mb-10">
            <h3 className="uppercase tracking-widest text-xs text-muted-foreground mb-4">Tamaño del Decant</h3>
            <div className="grid grid-cols-3 gap-4">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={cn(
                    "py-3 px-4 border text-center transition-all duration-300 relative overflow-hidden",
                    selectedVariantId === variant.id 
                      ? "border-primary text-primary" 
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {selectedVariantId === variant.id && (
                    <div className="absolute inset-0 bg-primary/10" />
                  )}
                  <span className="block font-serif text-xl relative z-10">{variant.sizeMl}ml</span>
                </button>
              ))}
            </div>
            {selectedVariant && selectedVariant.stock < 5 && (
              <p className="text-destructive text-xs mt-2 uppercase tracking-widest">
                ¡Solo {selectedVariant.stock} disponibles!
              </p>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <div className="flex items-center border border-border h-14 shrink-0">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-14 h-full flex items-center justify-center hover:text-primary transition-colors text-muted-foreground"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-14 h-full flex items-center justify-center hover:text-primary transition-colors text-muted-foreground"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariantId || addCartItemMutation.isPending}
              className="flex-1 h-14 bg-primary text-primary-foreground uppercase tracking-widest text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addCartItemMutation.isPending ? (
                "Agregando..."
              ) : (
                <>
                  <ShoppingBag size={18} /> Agregar al carrito
                </>
              )}
            </button>
          </div>

          {/* Perfume Details / Specs */}
          <div className="border-t border-border pt-8 space-y-6">
            {product.topNotes && product.topNotes.length > 0 && (
              <div>
                <h4 className="uppercase tracking-widest text-xs text-muted-foreground mb-2">Notas de Salida</h4>
                <p className="font-serif text-lg">{product.topNotes.join(" • ")}</p>
              </div>
            )}
            
            {product.heartNotes && product.heartNotes.length > 0 && (
              <div>
                <h4 className="uppercase tracking-widest text-xs text-muted-foreground mb-2">Notas de Corazón</h4>
                <p className="font-serif text-lg">{product.heartNotes.join(" • ")}</p>
              </div>
            )}
            
            {product.baseNotes && product.baseNotes.length > 0 && (
              <div>
                <h4 className="uppercase tracking-widest text-xs text-muted-foreground mb-2">Notas de Fondo</h4>
                <p className="font-serif text-lg">{product.baseNotes.join(" • ")}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 pt-4">
              {product.longevity && (
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Clock size={16} />
                    <h4 className="uppercase tracking-widest text-xs">Longevidad</h4>
                  </div>
                  <p className="font-serif">{product.longevity}</p>
                </div>
              )}
              {product.sillage && (
                <div>
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Wind size={16} />
                    <h4 className="uppercase tracking-widest text-xs">Estela (Sillage)</h4>
                  </div>
                  <p className="font-serif">{product.sillage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Related/Explore More (Static for now, could use a related query if available) */}
      <div className="border-t border-border pt-24 pb-12">
        <h2 className="text-3xl font-serif mb-10 text-center">Explora Más de {product.brand}</h2>
        <div className="text-center">
          <Link href={`/catalogo?brand=${product.brandSlug || product.brand}`} className="border border-border px-8 py-4 uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors inline-block">
            Ver Colección
          </Link>
        </div>
      </div>
    </div>
  );
}
