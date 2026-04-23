import { Link } from "wouter";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: cart } = useGetCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 border-b border-transparent",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-border/50 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-foreground"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-widest uppercase">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <Link href="/catalogo" className="hover:text-primary transition-colors">
            Catálogo
          </Link>
          <Link href="/marcas" className="hover:text-primary transition-colors">
            Marcas
          </Link>
        </nav>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <img
            src="/fanah-logo.png"
            alt="FANAH Fragrances"
            className={cn("transition-all duration-500", isScrolled ? "h-10" : "h-14")}
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/catalogo" className="p-2 text-foreground hover:text-primary transition-colors">
            <Search size={20} />
          </Link>
          <Link href="/carrito" className="relative p-2 text-foreground hover:text-primary transition-colors">
            <ShoppingBag size={20} />
            {cart?.itemCount ? (
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background border-b border-border/50 p-4 flex flex-col gap-4 shadow-xl md:hidden">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b border-border/30">
            Inicio
          </Link>
          <Link href="/catalogo" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b border-border/30">
            Catálogo
          </Link>
          <Link href="/marcas" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium py-2">
            Marcas
          </Link>
        </div>
      )}
    </header>
  );
}
