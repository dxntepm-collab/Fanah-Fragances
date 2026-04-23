import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  cartsTable,
  cartItemsTable,
  variantsTable,
  productsTable,
  brandsTable,
  ordersTable,
  orderItemsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

const router: IRouter = Router();

function shippingCostCents(method: string) {
  switch (method) {
    case "delivery_lima":
      return 1000;
    case "shipping_provincia":
      return 1800;
    case "pickup":
      return 0;
    default:
      return 0;
  }
}

router.post("/orders", async (req, res) => {
  const body = req.body as {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    city: string;
    shippingMethod: string;
    paymentMethod: string;
    notes?: string;
  };

  if (
    !body.customerName ||
    !body.customerEmail ||
    !body.customerPhone ||
    !body.shippingAddress ||
    !body.city ||
    !body.shippingMethod ||
    !body.paymentMethod
  ) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  const cartRows = await db
    .select()
    .from(cartsTable)
    .where(eq(cartsTable.sessionId, req.sessionId))
    .limit(1);
  if (!cartRows.length) {
    res.status(400).json({ error: "empty_cart" });
    return;
  }
  const cart = cartRows[0]!;

  const lineRows = await db
    .select({
      quantity: cartItemsTable.quantity,
      variantId: variantsTable.id,
      sizeMl: variantsTable.sizeMl,
      priceCents: variantsTable.priceCents,
      productId: productsTable.id,
      productName: productsTable.name,
      productSlug: productsTable.slug,
      imageUrl: productsTable.imageUrl,
      brand: brandsTable.name,
    })
    .from(cartItemsTable)
    .innerJoin(variantsTable, eq(cartItemsTable.variantId, variantsTable.id))
    .innerJoin(productsTable, eq(variantsTable.productId, productsTable.id))
    .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
    .where(eq(cartItemsTable.cartId, cart.id));

  if (!lineRows.length) {
    res.status(400).json({ error: "empty_cart" });
    return;
  }

  const items = lineRows.map((r) => ({
    variantId: r.variantId,
    productId: r.productId,
    productName: r.productName,
    productSlug: r.productSlug,
    brand: r.brand,
    sizeMl: r.sizeMl,
    imageUrl: r.imageUrl,
    unitPriceCents: r.priceCents,
    quantity: r.quantity,
    lineTotalCents: r.priceCents * r.quantity,
  }));

  const subtotalCents = items.reduce((s, i) => s + i.lineTotalCents, 0);
  const shippingCents = shippingCostCents(body.shippingMethod);
  const totalCents = subtotalCents + shippingCents;

  const orderNumber = `FA-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;

  const [order] = await db
    .insert(ordersTable)
    .values({
      orderNumber,
      status: "pending",
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      city: body.city,
      shippingMethod: body.shippingMethod,
      paymentMethod: body.paymentMethod,
      notes: body.notes ?? null,
      subtotalCents,
      shippingCents,
      totalCents,
    })
    .returning();

  await db.insert(orderItemsTable).values(
    items.map((i) => ({
      orderId: order!.id,
      ...i,
    })),
  );

  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));

  const inserted = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order!.id));

  res.json({
    id: order!.id,
    orderNumber: order!.orderNumber,
    status: order!.status,
    customerName: order!.customerName,
    customerEmail: order!.customerEmail,
    customerPhone: order!.customerPhone,
    shippingAddress: order!.shippingAddress,
    city: order!.city,
    shippingMethod: order!.shippingMethod,
    paymentMethod: order!.paymentMethod,
    notes: order!.notes ?? undefined,
    subtotalCents: order!.subtotalCents,
    shippingCents: order!.shippingCents,
    totalCents: order!.totalCents,
    items: inserted.map((i) => ({
      id: i.id,
      variantId: i.variantId,
      productId: i.productId,
      productName: i.productName,
      productSlug: i.productSlug,
      brand: i.brand,
      sizeMl: i.sizeMl,
      imageUrl: i.imageUrl,
      unitPriceCents: i.unitPriceCents,
      quantity: i.quantity,
      lineTotalCents: i.lineTotalCents,
    })),
    createdAt: order!.createdAt.toISOString(),
  });
});

router.get("/orders/:orderNumber", async (req, res) => {
  const orderRows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, req.params.orderNumber))
    .limit(1);
  if (!orderRows.length) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const order = orderRows[0]!;
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  res.json({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    city: order.city,
    shippingMethod: order.shippingMethod,
    paymentMethod: order.paymentMethod,
    notes: order.notes ?? undefined,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    items: items.map((i) => ({
      id: i.id,
      variantId: i.variantId,
      productId: i.productId,
      productName: i.productName,
      productSlug: i.productSlug,
      brand: i.brand,
      sizeMl: i.sizeMl,
      imageUrl: i.imageUrl,
      unitPriceCents: i.unitPriceCents,
      quantity: i.quantity,
      lineTotalCents: i.lineTotalCents,
    })),
    createdAt: order.createdAt.toISOString(),
  });
});

export default router;
