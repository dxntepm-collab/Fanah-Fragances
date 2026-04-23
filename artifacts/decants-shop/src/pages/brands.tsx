import { useListBrands, useGetCatalogSummary } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function Brands() {
  const { data: brands, isLoading: loadingBrands } = useListBrands();
  const { data: summary } = useGetCatalogSummary();

  // Group brands by first letter
  const groupedBrands = brands?.reduce((acc, brand) => {
    const letter = brand.name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {} as Record<string, typeof brands>);

  const letters = Object.keys(groupedBrands || {}).sort();

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center mb-16">
        <span className="text-primary/70 tracking-[0.2em] text-xs uppercase mb-4 block">Nuestras Casas Perfumistas</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6">Directorio de Marcas</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto font-light">
          Trabajamos exclusivamente con casas de perfumería nicho y diseñador de prestigio internacional, garantizando la autenticidad en cada decant.
        </p>
        {summary && (
          <div className="mt-8 inline-flex items-center gap-4 bg-card border border-border px-6 py-3">
            <div className="text-center">
              <span className="block text-2xl font-serif text-primary">{summary.totalBrands}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Marcas</span>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <span className="block text-2xl font-serif text-primary">{summary.totalProducts}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Fragancias</span>
            </div>
          </div>
        )}
      </div>

      {loadingBrands ? (
        <div className="space-y-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-12 w-12 bg-card/50 mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-6 bg-card/50 w-3/4"></div>
                <div className="h-6 bg-card/50 w-1/2"></div>
                <div className="h-6 bg-card/50 w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-16 max-w-5xl mx-auto">
          {letters.map((letter) => (
            <div key={letter} className="relative">
              <div className="flex items-baseline gap-4 mb-8 border-b border-border/50 pb-2">
                <h2 className="text-4xl font-serif text-primary">{letter}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-8">
                {groupedBrands![letter].map(brand => (
                  <Link 
                    key={brand.id} 
                    href={`/catalogo?brand=${brand.slug}`}
                    className="group block"
                  >
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-lg">
                      {brand.name}
                    </h3>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1 block">
                      {brand.productCount} fragancias
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
