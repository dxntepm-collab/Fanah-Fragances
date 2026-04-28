import { Link } from "wouter";
import { Instagram } from "lucide-react";

const TikTok = ({ size = 24 }: { size?: number }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

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
              <li>Piura, Piura, Perú</li>
              <li><a href="mailto:lujoembotellado@gmail.com" className="hover:text-primary transition-colors">lujoembotellado@gmail.com</a></li>
            </ul>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/fanah.fragancespiu/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@fanah.fragancespiu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <TikTok size={18} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FANAH Fragrances. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
