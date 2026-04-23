import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  brandsTable,
  productsTable,
  variantsTable,
  ordersTable,
  orderItemsTable,
} from "@workspace/db";
import { eq, desc, asc, count } from "drizzle-orm";
import {
  isAdminPassword,
  setAdminCookie,
  clearAdminCookie,
  isAuthenticated,
  requireAdmin,
} from "../lib/admin-auth";

const router: IRouter = Router();

router.post("/admin/login", (req, res) => {
  const { password } = (req.body ?? {}) as { password?: string };
  if (!password || !isAdminPassword(password)) {
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

router.get("/admin/dashboard", async (_req, res) => {
  const [{ c: totalProducts } = { c: 0 }] = await db
    .select({ c: count() })
    .from(productsTable);
  const [{ c: totalBrands } = { c: 0 }] = await db
    .select({ c: count() })
    .from(brandsTable);
  const [{ c: totalOrders } = { c: 0 }] = await db
    .select({ c: count() })
    .from(ordersTable);
  const ordersByStatus = await db
    .select({ status: ordersTable.status, c: count() })
    .from(ordersTable)
    .groupBy(ordersTable.status);
  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(5);

  res.json({
    totals: {
      products: Number(totalProducts),
      brands: Number(totalBrands),
      orders: Number(totalOrders),
    },
    ordersByStatus: ordersByStatus.map((r) => ({
      status: r.status,
      count: Number(r.c),
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      customerName: o.customerName,
      totalCents: o.totalCents,
      createdAt: o.createdAt.toISOString(),
    })),
  });
});

router.get("/admin/brands", async (_req, res) => {
  const rows = await db
    .select({
      id: brandsTable.id,
      name: brandsTable.name,
      slug: brandsTable.slug,
      country: brandsTable.country,
      productCount: count(productsTable.id),
    })
    .from(brandsTable)
    .leftJoin(productsTable, eq(productsTable.brandId, brandsTable.id))
    .groupBy(brandsTable.id)
    .orderBy(asc(brandsTable.name));
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      country: r.country ?? null,
      productCount: Number(r.productCount),
    })),
  );
});

router.post("/admin/brands", async (req, res) => {
  const { name, slug, country } = (req.body ?? {}) as Record<string, string>;
  if (!name || !slug) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  const [b] = await db
    .insert(brandsTable)
    .values({ name, slug, country: country || null })
    .returning();
  res.json(b);
});

router.patch("/admin/brands/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, slug, country } = (req.body ?? {}) as Record<string, string>;
  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (slug !== undefined) update.slug = slug;
  if (country !== undefined) update.country = country || null;
  const [b] = await db
    .update(brandsTable)
    .set(update)
    .where(eq(brandsTable.id, id))
    .returning();
  res.json(b);
});

router.delete("/admin/brands/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [{ c } = { c: 0 }] = await db
    .select({ c: count() })
    .from(productsTable)
    .where(eq(productsTable.brandId, id));
  if (Number(c) > 0) {
    res.status(400).json({ error: "brand_has_products" });
    return;
  }
  await db.delete(brandsTable).where(eq(brandsTable.id, id));
  res.json({ ok: true });
});

router.get("/admin/products", async (_req, res) => {
  const rows = await db
    .select({
      id: productsTable.id,
      slug: productsTable.slug,
      name: productsTable.name,
      gender: productsTable.gender,
      family: productsTable.family,
      imageUrl: productsTable.imageUrl,
      isFeatured: productsTable.isFeatured,
      isNew: productsTable.isNew,
      popularity: productsTable.popularity,
      brandId: productsTable.brandId,
      brand: brandsTable.name,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
    .orderBy(desc(productsTable.createdAt));
  res.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.get("/admin/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [p] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  if (!p) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const variants = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.productId, id))
    .orderBy(asc(variantsTable.sizeMl));
  res.json({ ...p, createdAt: p.createdAt.toISOString(), variants });
});

router.post("/admin/products", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  if (!body.name || !body.slug || !body.brandId) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  const [p] = await db
    .insert(productsTable)
    .values({
      brandId: Number(body.brandId),
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
    })
    .returning();
  res.json(p);
});

router.patch("/admin/products/:id", async (req, res) => {
  const id = Number(req.params.id);
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
  if (body.brandId !== undefined) update.brandId = Number(body.brandId);
  if (body.popularity !== undefined)
    update.popularity = Number(body.popularity);
  if (body.isFeatured !== undefined) update.isFeatured = Boolean(body.isFeatured);
  if (body.isNew !== undefined) update.isNew = Boolean(body.isNew);
  for (const k of ["topNotes", "heartNotes", "baseNotes"]) {
    if (Array.isArray(body[k])) update[k] = body[k];
  }
  const [p] = await db
    .update(productsTable)
    .set(update)
    .where(eq(productsTable.id, id))
    .returning();
  res.json(p);
});

router.delete("/admin/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(variantsTable).where(eq(variantsTable.productId, id));
  await db.delete(productsTable).where(eq(productsTable.id, id));
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
  const [v] = await db
    .insert(variantsTable)
    .values({
      productId,
      sizeMl: Number(sizeMl),
      priceCents: Number(priceCents),
      stock: Number(stock ?? 50),
    })
    .returning();
  res.json(v);
});

router.patch("/admin/variants/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { sizeMl, priceCents, stock } = (req.body ?? {}) as Record<
    string,
    number
  >;
  const update: Record<string, unknown> = {};
  if (sizeMl !== undefined) update.sizeMl = Number(sizeMl);
  if (priceCents !== undefined) update.priceCents = Number(priceCents);
  if (stock !== undefined) update.stock = Number(stock);
  const [v] = await db
    .update(variantsTable)
    .set(update)
    .where(eq(variantsTable.id, id))
    .returning();
  res.json(v);
});

router.delete("/admin/variants/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(variantsTable).where(eq(variantsTable.id, id));
  res.json({ ok: true });
});

router.get("/admin/orders", async (_req, res) => {
  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
  res.json(
    rows.map((o) => ({
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
      createdAt: o.createdAt.toISOString(),
    })),
  );
});

router.get("/admin/orders/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [o] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1);
  if (!o) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, o.id));
  res.json({ ...o, createdAt: o.createdAt.toISOString(), items });
});

router.patch("/admin/orders/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = (req.body ?? {}) as { status?: string };
  if (!status) {
    res.status(400).json({ error: "missing_status" });
    return;
  }
  const [o] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, id))
    .returning();
  res.json(o);
});

export default router;
