const BASE = `${import.meta.env.BASE_URL}api`.replace(/\/+/g, "/");

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const adminApi = {
  login: (password: string) => req<{ ok: true }>("POST", "/admin/login", { password }),
  logout: () => req<{ ok: true }>("POST", "/admin/logout"),
  session: () => req<{ authenticated: boolean }>("GET", "/admin/session"),
  dashboard: () =>
    req<{
      totals: { products: number; brands: number; orders: number };
      ordersByStatus: { status: string; count: number }[];
      recentOrders: {
        id: number;
        orderNumber: string;
        status: string;
        customerName: string;
        totalCents: number;
        createdAt: string;
      }[];
    }>("GET", "/admin/dashboard"),
  brands: () =>
    req<
      {
        id: number;
        name: string;
        slug: string;
        country: string | null;
        productCount: number;
      }[]
    >("GET", "/admin/brands"),
  createBrand: (b: { name: string; slug: string; country?: string }) =>
    req("POST", "/admin/brands", b),
  updateBrand: (
    id: number,
    b: { name?: string; slug?: string; country?: string },
  ) => req("PATCH", `/admin/brands/${id}`, b),
  deleteBrand: (id: number) => req("DELETE", `/admin/brands/${id}`),
  products: () =>
    req<
      {
        id: number;
        slug: string;
        name: string;
        gender: string;
        family: string;
        imageUrl: string;
        isFeatured: boolean;
        isNew: boolean;
        popularity: number;
        brandId: number;
        brand: string;
        createdAt: string;
      }[]
    >("GET", "/admin/products"),
  product: (id: number) =>
    req<{
      id: number;
      brandId: number;
      slug: string;
      name: string;
      gender: string;
      family: string;
      description: string;
      topNotes: string[];
      heartNotes: string[];
      baseNotes: string[];
      longevity: string | null;
      sillage: string | null;
      imageUrl: string;
      isFeatured: boolean;
      isNew: boolean;
      popularity: number;
      variants: { id: number; sizeMl: number; priceCents: number; stock: number }[];
    }>("GET", `/admin/products/${id}`),
  createProduct: (p: Record<string, unknown>) =>
    req<{ id: number }>("POST", "/admin/products", p),
  updateProduct: (id: number, p: Record<string, unknown>) =>
    req("PATCH", `/admin/products/${id}`, p),
  deleteProduct: (id: number) => req("DELETE", `/admin/products/${id}`),
  addVariant: (
    productId: number,
    v: { sizeMl: number; priceCents: number; stock?: number },
  ) => req("POST", `/admin/products/${productId}/variants`, v),
  updateVariant: (
    id: number,
    v: { sizeMl?: number; priceCents?: number; stock?: number },
  ) => req("PATCH", `/admin/variants/${id}`, v),
  deleteVariant: (id: number) => req("DELETE", `/admin/variants/${id}`),
  orders: () =>
    req<
      {
        id: number;
        orderNumber: string;
        status: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        city: string;
        shippingMethod: string;
        paymentMethod: string;
        totalCents: number;
        createdAt: string;
      }[]
    >("GET", "/admin/orders"),
  order: (id: number) =>
    req<{
      id: number;
      orderNumber: string;
      status: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddress: string;
      city: string;
      shippingMethod: string;
      paymentMethod: string;
      notes: string | null;
      subtotalCents: number;
      shippingCents: number;
      totalCents: number;
      createdAt: string;
      items: {
        id: number;
        productName: string;
        brand: string;
        sizeMl: number;
        unitPriceCents: number;
        quantity: number;
        lineTotalCents: number;
      }[];
    }>("GET", `/admin/orders/${id}`),
  updateOrderStatus: (id: number, status: string) =>
    req("PATCH", `/admin/orders/${id}`, { status }),
};
