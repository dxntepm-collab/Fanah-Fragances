import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import Brands from "@/pages/brands";
import CartPage from "@/pages/cart";
import Checkout from "@/pages/checkout";
import OrderConfirmation from "@/pages/order-confirmation";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminProductEdit from "@/pages/admin/product-edit";
import AdminBrands from "@/pages/admin/brands";
import AdminOrders from "@/pages/admin/orders";
import AdminOrderDetail from "@/pages/admin/order-detail";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Extraer hash de la URL
    const hashIndex = location.indexOf('#');
    if (hashIndex > -1) {
      const hash = location.substring(hashIndex + 1);
      // Esperar a que el DOM se actualice
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    } else {
      // Sin hash, scroll al top
      window.scrollTo(0, 0);
    }
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/productos" component={AdminProducts} />
      <Route path="/admin/productos/:id" component={AdminProductEdit} />
      <Route path="/admin/marcas" component={AdminBrands} />
      <Route path="/admin/pedidos" component={AdminOrders} />
      <Route path="/admin/pedidos/:id" component={AdminOrderDetail} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/catalogo" component={Catalog} />
            <Route path="/marcas" component={Brands} />
            <Route path="/carrito" component={CartPage} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/perfume/:slug" component={ProductDetail} />
            <Route path="/pedido/:orderNumber" component={OrderConfirmation} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
