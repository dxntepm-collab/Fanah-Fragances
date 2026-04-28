import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";
import { useLocation } from "wouter";
import { Filter, Search as SearchIcon, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Catalog() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [gender, setGender] = useState<string | undefined>(searchParams.get("gender") || undefined);
  const [sort, setSort] = useState<string | undefined>(searchParams.get("sort") || undefined);
  const [search, setSearch] = useState<string | undefined>(searchParams.get("search") || undefined);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: products, isLoading } = useListProducts({
    gender: gender as any,
    sort: sort as any,
    search: search || undefined
  }, { query: { queryKey: getListProductsQueryKey({ gender: gender as any, sort: sort as any, search }) } });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearch(formData.get("q") as string);
  };

  const clearFilters = () => {
    setGender(undefined);
    setSort(undefined);
    setSearch(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-3xl font-serif">Catálogo</h1>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 border border-border px-4 py-2 text-sm uppercase tracking-widest"
        >
          <Filter size={16} /> Filtros
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={cn(
        "w-full md:w-64 shrink-0 transition-all duration-300 md:block",
        isFilterOpen ? "block" : "hidden"
      )}>
        <div className="sticky top-24 space-y-8">
          <div className="hidden md:block">
            <h1 className="text-4xl font-serif mb-2">Catálogo</h1>
            <p className="text-muted-foreground text-sm">Explora nuestra colección completa</p>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input 
              name="q"
              defaultValue={search}
              placeholder="Buscar perfume o marca..." 
              className="w-full bg-transparent border-b border-border py-2 pl-8 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <SearchIcon size={16} className="absolute left-0 top-3 text-muted-foreground" />
          </form>

          <div>
            <h3 className="font-serif text-xl mb-4 flex items-center justify-between">
              Género
              {gender && <button onClick={() => setGender(undefined)} className="text-xs text-muted-foreground hover:text-primary"><X size={14}/></button>}
            </h3>
            <div className="space-y-2">
              {[
                { id: "men", label: "Hombre" },
                { id: "women", label: "Mujer" },
                { id: "unisex", label: "Unisex" }
              ].map(g => (
                <label key={g.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={cn(
                    "w-4 h-4 border flex items-center justify-center transition-colors",
                    gender === g.id ? "border-primary bg-primary text-primary-foreground" : "border-border group-hover:border-primary"
                  )}>
                    {gender === g.id && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                  </div>
                  <input 
                    type="radio" 
                    name="gender" 
                    value={g.id} 
                    checked={gender === g.id} 
                    onChange={(e) => setGender(e.target.value)} 
                    className="sr-only" 
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors uppercase tracking-widest">{g.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif text-xl mb-4">Ordenar por</h3>
            <div className="space-y-2">
              {[
                { id: "newest", label: "Más recientes" },
                { id: "popular", label: "Más populares" },
                { id: "price_asc", label: "Precio: Menor a Mayor" },
                { id: "price_desc", label: "Precio: Mayor a Menor" }
              ].map(s => (
                <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={cn(
                    "w-4 h-4 border flex items-center justify-center transition-colors",
                    sort === s.id ? "border-primary bg-primary text-primary-foreground" : "border-border group-hover:border-primary"
                  )}>
                    {sort === s.id && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                  </div>
                  <input 
                    type="radio" 
                    name="sort" 
                    value={s.id} 
                    checked={sort === s.id} 
                    onChange={(e) => setSort(e.target.value)} 
                    className="sr-only" 
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors uppercase tracking-widest">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {(gender || sort || search) && (
            <button 
              onClick={clearFilters}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-[500px]">
        {/* Active Filters Summary */}
        <div className="mb-6 flex flex-wrap gap-2 items-center text-xs">
          <span className="text-muted-foreground uppercase tracking-widest mr-2">Filtros activos:</span>
          {!gender && !sort && !search && <span className="italic text-muted-foreground">Ninguno</span>}
          {search && (
            <span className="bg-card border border-border px-3 py-1 flex items-center gap-2">
              Búsqueda: {search} <button onClick={() => setSearch(undefined)}><X size={12} className="hover:text-primary"/></button>
            </span>
          )}
          {gender && (
            <span className="bg-card border border-border px-3 py-1 flex items-center gap-2 uppercase">
              {gender === 'men' ? 'Hombre' : gender === 'women' ? 'Mujer' : 'Unisex'} 
              <button onClick={() => setGender(undefined)}><X size={12} className="hover:text-primary"/></button>
            </span>
          )}
          {sort && (
            <span className="bg-card border border-border px-3 py-1 flex items-center gap-2 uppercase">
              {sort === 'newest' ? 'Recientes' : sort === 'popular' ? 'Populares' : sort === 'price_asc' ? 'Menor Precio' : 'Mayor Precio'}
              <button onClick={() => setSort(undefined)}><X size={12} className="hover:text-primary"/></button>
            </span>
          )}
          
          <div className="ml-auto text-muted-foreground uppercase tracking-widest">
            {products?.length || 0} resultados
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="bg-card/50 aspect-[3/4] w-full border border-border/50"></div>
                <div className="h-4 bg-card/50 w-1/2 mx-auto"></div>
                <div className="h-6 bg-card/50 w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (products || []).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {(products || []).map((product, i) => (
              <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-border/50 bg-card/20">
            <SlidersHorizontal size={48} className="text-muted-foreground mb-4 opacity-50" strokeWidth={1} />
            <h3 className="text-2xl font-serif mb-2">No se encontraron fragancias</h3>
            <p className="text-muted-foreground mb-6">Prueba ajustando tus filtros para encontrar lo que buscas.</p>
            <button 
              onClick={clearFilters}
              className="bg-primary text-primary-foreground px-6 py-2 uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
