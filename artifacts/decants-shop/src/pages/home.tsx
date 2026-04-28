import { useListFeaturedProducts, useListBestsellers, useListNewArrivals } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "wouter";
import { ArrowRight, Droplet, Star, ShieldCheck } from "lucide-react";

export default function Home() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useListFeaturedProducts();
  const { data: bestsellers, isLoading: loadingBestsellers } = useListBestsellers();
  const { data: newArrivals, isLoading: loadingNewArrivals } = useListNewArrivals();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/60 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20"></div>
          {/* Placeholder for hero background, using abstract gradient since no specific image URL provided */}
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2a2416] via-background to-background object-cover" />
        </div>
        
        <div className="relative z-30 container mx-auto px-4 text-center max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="text-primary tracking-[0.3em] text-sm uppercase mb-4 block font-medium">La Colección Privada</span>
          <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
            Descubre Tu <br/>
            <span className="gold-gradient-text italic">Firma Olfativa</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 font-light max-w-xl mx-auto">
            Experimenta las fragancias más exclusivas del mundo en formatos decant de lujo. Alta perfumería a tu alcance en Piura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogo" className="bg-primary text-primary-foreground px-8 py-4 uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              Explorar Catálogo <ArrowRight size={16} />
            </Link>
            <a href="#que-es-un-decant" className="border border-border px-8 py-4 uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-colors cursor-pointer">
              ¿Qué es un decant?
            </a>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex flex-col items-center mb-16">
          <span className="text-primary/70 tracking-[0.2em] text-xs uppercase mb-2">Selección Exclusiva</span>
          <h2 className="text-3xl md:text-4xl font-serif text-center">Colección Destacada</h2>
          <div className="w-12 h-[1px] bg-primary mt-6"></div>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="bg-card/50 aspect-[3/4] w-full border border-border/50"></div>
                <div className="h-4 bg-card/50 w-1/2 mx-auto"></div>
                <div className="h-6 bg-card/50 w-3/4 mx-auto"></div>
                <div className="h-4 bg-card/50 w-1/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {Array.isArray(featuredProducts) && featuredProducts.length > 0 ?
             featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
             )) : <div className="col-span-full text-center text-muted-foreground">No hay productos destacados</div>
            }
          </div>
        )}
      </section>

      {/* Educational Section - What is a decant */}
      <section id="que-es-un-decant" className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative h-[500px] border border-border/50 p-4">
               {/* Elegant frame around a placeholder for the decant process image */}
               <div className="w-full h-full bg-background border border-border/30 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>
                 <div className="text-center z-10 p-8">
                   <Droplet className="mx-auto mb-4 text-primary opacity-50" size={48} strokeWidth={1} />
                   <p className="font-serif italic text-2xl text-muted-foreground">La extracción perfecta</p>
                 </div>
               </div>
            </div>
            
            <div className="order-1 md:order-2">
              <span className="text-primary/70 tracking-[0.2em] text-xs uppercase mb-2 block">La Experiencia FANAH</span>
              <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">¿Qué es exactamente un <span className="gold-gradient-text italic">Decant</span>?</h2>
              
              <div className="space-y-8 mt-10">
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0 text-primary">
                    <Droplet size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-2">Extracción Pura</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      Un decant es una fracción del perfume original, extraído con precisión quirúrgica directamente de la botella de diseño a un atomizador de menor tamaño. Sin alteraciones, sin diluciones.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0 text-primary">
                    <Star size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-2">Exploración Sin Límites</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      No compres a ciegas. Los decants te permiten probar en tu piel, vivir la evolución de sus notas durante días y asegurarte que esa fragancia de S/ 1,500 es realmente para ti.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 shrink-0 text-primary">
                    <ShieldCheck size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-2">Autenticidad Garantizada</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">
                      Elaboramos cada decant bajo pedido utilizando jeringas estériles, garantizando el 100% de pureza. Tu decant viaja en frascos de vidrio premium que protegen el jugo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif">Más Vendidos</h2>
            <div className="w-12 h-[1px] bg-primary mt-4"></div>
          </div>
          <Link href="/catalogo?sort=popular" className="text-xs tracking-widest uppercase hover:text-primary transition-colors flex items-center gap-2">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {loadingBestsellers ? (
          <div className="flex justify-center py-12"><div className="animate-pulse bg-primary/20 w-8 h-8 rounded-full"></div></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {Array.isArray(bestsellers) && bestsellers.length > 0 ?
              bestsellers.slice(0, 5).map(product => (
                <ProductCard key={product.id} product={product} />
              )) : <div className="col-span-full text-center text-muted-foreground">No hay productos disponibles</div>
            }
          </div>
        )}
      </section>
      
      {/* New Arrivals */}
      <section className="py-24 bg-card/30 container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif">Nuevos Ingresos</h2>
            <div className="w-12 h-[1px] bg-primary mt-4"></div>
          </div>
          <Link href="/catalogo?sort=newest" className="text-xs tracking-widest uppercase hover:text-primary transition-colors flex items-center gap-2">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {loadingNewArrivals ? (
          <div className="flex justify-center py-12"><div className="animate-pulse bg-primary/20 w-8 h-8 rounded-full"></div></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {Array.isArray(newArrivals) && newArrivals.length > 0 ?
              newArrivals.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              )) : <div className="col-span-full text-center text-muted-foreground">No hay productos disponibles</div>
            }
          </div>
        )}
      </section>
    </div>
  );
}
