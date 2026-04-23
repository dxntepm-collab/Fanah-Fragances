import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/perfume/${product.slug}`} className="group block relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-card/50 mb-4 rounded-sm border border-border/50 group-hover:border-primary/50 transition-colors duration-500">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100 mix-blend-screen"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-2 py-1">
              Nuevo
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-white text-black text-[10px] tracking-widest uppercase px-2 py-1">
              Destacado
            </span>
          )}
        </div>
        
        {/* Gender Badge */}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] tracking-widest uppercase border border-border/80 px-2 py-1 bg-background/50 backdrop-blur-sm">
            {product.gender === "men" ? "Hombre" : product.gender === "women" ? "Mujer" : "Unisex"}
          </span>
        </div>
      </div>
      
      <div className="text-center px-2">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">{product.brand}</p>
        <h3 className="font-serif text-lg mb-2 text-foreground truncate">{product.name}</h3>
        <p className="text-sm font-medium text-primary">
          Desde {formatPrice(product.fromPriceCents)}
        </p>
      </div>
    </Link>
  );
}
