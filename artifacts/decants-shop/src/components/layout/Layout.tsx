import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-20 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
