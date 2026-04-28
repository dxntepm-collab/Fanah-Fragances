import { Router, type IRouter } from "express";
import { fdb, genId } from "../lib/firestore";
import {
  isAdminPassword,
  setAdminCookie,
  clearAdminCookie,
  isAuthenticated,
  requireAdmin,
} from "../lib/admin-auth";

const router: IRouter = Router();

type BrandDoc = {
  id: number;
  name: string;
  slug: string;
  country?: string | null;
};
type ProductDoc = {
  id: number;
  brandId: number;
  brandName: string;
  brandSlug: string;
  slug: string;
  name: string;
  gender: string;
  family: string;
  description: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  longevity?: string | null;
  sillage?: string | null;
  imageUrl: string;
  isFeatured: boolean;
  isNew: boolean;
  popularity: number;
  createdAt: number;
};
type VariantDoc = {
  id: number;
  productId: number;
  sizeMl: number;
  priceCents: number;
  stock: number;
};
type OrderDoc = {
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
  items: unknown[];
  createdAt: number;
};

router.post("/admin/login", (req, res) => {
  const { password } = (req.body ?? {}) as { password?: string };
  
  if (!password) {
    res.status(400).json({ error: "password_required" });
    return;
  }
  
  if (!isAdminPassword(password)) {
    // Log failed attempts (security)
    console.warn(
      `[SECURITY] Failed admin login attempt from ${req.ip}`,
    );
    res.status(401).json({ error: "invalid_password" });
    return;
  }
  
  setAdminCookie(res);
  res.json({ ok: true });
});

router.post("/admin/logout", (_req, res) => {
  clearAdminCookie(res);
  res.json({ ok: true });
});

router.get("/admin/session", (req, res) => {
  res.json({ authenticated: isAuthenticated(req) });
});

router.use("/admin", requireAdmin);

async function findDocByIntId(collection: string, id: number) {
  const snap = await fdb()
    .collection(collection)
    .where("id", "==", id)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0]!;
}

router.get("/admin/dashboard", async (_req, res) => {
  const [productsSnap, brandsSnap, ordersSnap] = await Promise.all([
    fdb().collection("products").get(),
    fdb().collection("brands").get(),
    fdb().collection("orders").get(),
  ]);
  const orders = ordersSnap.docs.map((d) => d.data() as OrderDoc);
  const byStatus: Record<string, number> = {};
  for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  const recent = orders
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      customerName: o.customerName,
      totalCents: o.totalCents,
      createdAt: new Date(o.createdAt).toISOString(),
    }));
  res.json({
    totals: {
      products: productsSnap.size,
      brands: brandsSnap.size,
      orders: ordersSnap.size,
    },
    ordersByStatus: Object.entries(byStatus).map(([status, count]) => ({
      status,
      count,
    })),
    recentOrders: recent,
  });
});

router.get("/admin/brands", async (_req, res) => {
  const [brandsSnap, productsSnap] = await Promise.all([
    fdb().collection("brands").get(),
    fdb().collection("products").get(),
  ]);
  const brands = brandsSnap.docs.map((d) => d.data() as BrandDoc);
  const products = productsSnap.docs.map((d) => d.data() as ProductDoc);
  res.json(
    brands
      .map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        country: b.country ?? null,
        productCount: products.filter((p) => p.brandId === b.id).length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  );
});

router.post("/admin/brands", async (req, res) => {
  const { name, slug, country } = (req.body ?? {}) as Record<string, string>;
  if (!name || !slug) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  const brand: BrandDoc = {
    id: genId(),
    name,
    slug,
    country: country || null,
  };
  await fdb().collection("brands").doc(String(brand.id)).set(brand);
  res.json(brand);
});

router.patch("/admin/brands/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, slug, country } = (req.body ?? {}) as Record<string, string>;
  const doc = await findDocByIntId("brands", id);
  if (!doc) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const update: Partial<BrandDoc> = {};
  if (name !== undefined) update.name = name;
  if (slug !== undefined) update.slug = slug;
  if (country !== undefined) update.country = country || null;
  await doc.ref.update(update);

  if (update.name || update.slug) {
    const productsSnap = await fdb()
      .collection("products")
      .where("brandId", "==", id)
      .get();
    const batch = fdb().batch();
    productsSnap.docs.forEach((d) => {
      const u: Record<string, string> = {};
      if (update.name) u.brandName = update.name;
      if (update.slug) u.brandSlug = update.slug;
      batch.update(d.ref, u);
    });
    await batch.commit();
  }

  const updated = (await doc.ref.get()).data();
  res.json(updated);
});

router.delete("/admin/brands/:id", async (req, res) => {
  const id = Number(req.params.id);
  const productsSnap = await fdb()
    .collection("products")
    .where("brandId", "==", id)
    .limit(1)
    .get();
  if (!productsSnap.empty) {
    res.status(400).json({ error: "brand_has_products" });
    return;
  }
  const doc = await findDocByIntId("brands", id);
  if (doc) await doc.ref.delete();
  res.json({ ok: true });
});

router.get("/admin/products", async (_req, res) => {
  const snap = await fdb().collection("products").get();
  const products = snap.docs
    .map((d) => d.data() as ProductDoc)
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json(
    products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      gender: p.gender,
      family: p.family,
      imageUrl: p.imageUrl,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      popularity: p.popularity,
      brandId: p.brandId,
      brand: p.brandName,
      createdAt: new Date(p.createdAt).toISOString(),
    })),
  );
});

router.get("/admin/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const doc = await findDocByIntId("products", id);
  if (!doc) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const p = doc.data() as ProductDoc;
  const variantsSnap = await fdb()
    .collection("variants")
    .where("productId", "==", id)
    .get();
  const variants = variantsSnap.docs
    .map((d) => d.data() as VariantDoc)
    .sort((a, b) => a.sizeMl - b.sizeMl);
  res.json({
    ...p,
    createdAt: new Date(p.createdAt).toISOString(),
    variants,
  });
});

router.post("/admin/products", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  if (!body.name || !body.slug || !body.brandId) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  const brandDoc = await findDocByIntId("brands", Number(body.brandId));
  if (!brandDoc) {
    res.status(400).json({ error: "brand_not_found" });
    return;
  }
  const brand = brandDoc.data() as BrandDoc;
  const product: ProductDoc = {
    id: genId(),
    brandId: brand.id,
    brandName: brand.name,
    brandSlug: brand.slug,
    slug: String(body.slug),
    name: String(body.name),
    gender: String(body.gender ?? "unisex"),
    family: String(body.family ?? "Oriental"),
    description: String(body.description ?? ""),
    topNotes: (body.topNotes as string[]) ?? [],
    heartNotes: (body.heartNotes as string[]) ?? [],
    baseNotes: (body.baseNotes as string[]) ?? [],
    longevity: (body.longevity as string) ?? null,
    sillage: (body.sillage as string) ?? null,
    imageUrl: String(body.imageUrl ?? ""),
    isFeatured: Boolean(body.isFeatured),
    isNew: Boolean(body.isNew),
    popularity: Number(body.popularity ?? 0),
    createdAt: Date.now(),
  };
  await fdb().collection("products").doc(String(product.id)).set(product);
  res.json(product);
});

router.patch("/admin/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const doc = await findDocByIntId("products", id);
  if (!doc) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const body = (req.body ?? {}) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  for (const k of [
    "name",
    "slug",
    "gender",
    "family",
    "description",
    "imageUrl",
    "longevity",
    "sillage",
  ]) {
    if (body[k] !== undefined) update[k] = body[k];
  }
  if (body.brandId !== undefined) {
    const bDoc = await findDocByIntId("brands", Number(body.brandId));
    if (!bDoc) {
      res.status(400).json({ error: "brand_not_found" });
      return;
    }
    const b = bDoc.data() as BrandDoc;
    update.brandId = b.id;
    update.brandName = b.name;
    update.brandSlug = b.slug;
  }
  if (body.popularity !== undefined)
    update.popularity = Number(body.popularity);
  if (body.isFeatured !== undefined)
    update.isFeatured = Boolean(body.isFeatured);
  if (body.isNew !== undefined) update.isNew = Boolean(body.isNew);
  for (const k of ["topNotes", "heartNotes", "baseNotes"]) {
    if (Array.isArray(body[k])) update[k] = body[k];
  }
  await doc.ref.update(update);
  const updated = (await doc.ref.get()).data();
  res.json(updated);
});

router.delete("/admin/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const variantsSnap = await fdb()
    .collection("variants")
    .where("productId", "==", id)
    .get();
  const batch = fdb().batch();
  variantsSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  const doc = await findDocByIntId("products", id);
  if (doc) await doc.ref.delete();
  res.json({ ok: true });
});

router.post("/admin/products/:id/variants", async (req, res) => {
  const productId = Number(req.params.id);
  const { sizeMl, priceCents, stock } = (req.body ?? {}) as Record<
    string,
    number
  >;
  if (!sizeMl || !priceCents) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  const variant: VariantDoc = {
    id: genId(),
    productId,
    sizeMl: Number(sizeMl),
    priceCents: Number(priceCents),
    stock: Number(stock ?? 50),
  };
  await fdb().collection("variants").doc(String(variant.id)).set(variant);
  res.json(variant);
});

router.patch("/admin/variants/:id", async (req, res) => {
  const id = Number(req.params.id);
  const doc = await findDocByIntId("variants", id);
  if (!doc) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const { sizeMl, priceCents, stock } = (req.body ?? {}) as Record<
    string,
    number
  >;
  const update: Record<string, number> = {};
  if (sizeMl !== undefined) update.sizeMl = Number(sizeMl);
  if (priceCents !== undefined) update.priceCents = Number(priceCents);
  if (stock !== undefined) update.stock = Number(stock);
  await doc.ref.update(update);
  res.json((await doc.ref.get()).data());
});

router.delete("/admin/variants/:id", async (req, res) => {
  const id = Number(req.params.id);
  const doc = await findDocByIntId("variants", id);
  if (doc) await doc.ref.delete();
  res.json({ ok: true });
});

router.get("/admin/orders", async (_req, res) => {
  const snap = await fdb().collection("orders").get();
  const orders = snap.docs
    .map((d) => d.data() as OrderDoc)
    .sort((a, b) => b.createdAt - a.createdAt);
  res.json(
    orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      city: o.city,
      shippingMethod: o.shippingMethod,
      paymentMethod: o.paymentMethod,
      totalCents: o.totalCents,
      createdAt: new Date(o.createdAt).toISOString(),
    })),
  );
});

router.get("/admin/orders/:id", async (req, res) => {
  const id = Number(req.params.id);
  const doc = await findDocByIntId("orders", id);
  if (!doc) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const o = doc.data() as OrderDoc;
  res.json({ ...o, createdAt: new Date(o.createdAt).toISOString() });
});

router.patch("/admin/orders/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = (req.body ?? {}) as { status?: string };
  if (!status) {
    res.status(400).json({ error: "missing_status" });
    return;
  }
  const doc = await findDocByIntId("orders", id);
  if (!doc) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  await doc.ref.update({ status });
  const o = (await doc.ref.get()).data() as OrderDoc;
  res.json({ ...o, createdAt: new Date(o.createdAt).toISOString() });
});

export default router;
