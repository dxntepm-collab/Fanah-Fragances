import { Link } from "wouter";
import { Instagram, Facebook, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card mt-24 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <img src="/fanah-logo.png" alt="FANAH Fragrances" className="h-12 mb-6" />
            <p className="text-muted-foreground max-w-sm font-serif italic text-lg">
              La experiencia olfativa de lujo. Descubre el mundo de la perfumería nicho y de diseñador a través de nuestros decants exclusivos.
            </p>
          </div>
          
          <div>
            <h4 className="font-serif text-xl mb-6 text-foreground">Enlaces</h4>
            <ul className="flex flex-col gap-3 text-muted-foreground text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link href="/catalogo" className="hover:text-primary transition-colors">Catálogo</Link></li>
              <li><Link href="/marcas" className="hover:text-primary transition-colors">Marcas</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif text-xl mb-6 text-foreground">Contacto</h4>
            <ul className="flex flex-col gap-3 text-muted-foreground text-sm mb-6">
              <li>Miraflores, Lima, Perú</li>
              <li><a href="mailto:hola@fanahfragrances.com" className="hover:text-primary transition-colors">hola@fanahfragrances.com</a></li>
            </ul>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FANAH Fragrances. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span>Yape</span>
            <span>Plin</span>
            <span>Transferencia Bancaria</span>
            <span>Contraentrega</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
