import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  cartsTable,
  cartItemsTable,
  variantsTable,
  productsTable,
  brandsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

async function getOrCreateCart(sessionId: string) {
  const existing = await db
    .select()
    .from(cartsTable)
    .where(eq(cartsTable.sessionId, sessionId))
    .limit(1);
  if (existing.length) return existing[0]!;
  const [created] = await db
    .insert(cartsTable)
    .values({ sessionId })
    .returning();
  return created!;
}

async function buildCartResponse(cartId: number) {
  const rows = await db
    .select({
      itemId: cartItemsTable.id,
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
    .where(eq(cartItemsTable.cartId, cartId));

  const items = rows.map((r) => ({
    id: r.itemId,
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
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return { items, subtotalCents, itemCount };
}

router.get("/cart", async (req, res) => {
  const cart = await getOrCreateCart(req.sessionId);
  res.json(await buildCartResponse(cart.id));
});

router.delete("/cart", async (req, res) => {
  const cart = await getOrCreateCart(req.sessionId);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
  res.json(await buildCartResponse(cart.id));
});

router.post("/cart/items", async (req, res) => {
  const { variantId, quantity } = req.body as {
    variantId: number;
    quantity: number;
  };
  if (!variantId || !quantity || quantity < 1) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const cart = await getOrCreateCart(req.sessionId);

  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.cartId, cart.id),
        eq(cartItemsTable.variantId, variantId),
      ),
    )
    .limit(1);

  if (existing.length) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing[0]!.quantity + quantity })
      .where(eq(cartItemsTable.id, existing[0]!.id));
  } else {
    await db.insert(cartItemsTable).values({
      cartId: cart.id,
      variantId,
      quantity,
    });
  }
  res.json(await buildCartResponse(cart.id));
});

router.patch("/cart/items/:itemId", async (req, res) => {
  const itemId = Number(req.params.itemId);
  const { quantity } = req.body as { quantity: number };
  if (!quantity || quantity < 1) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const cart = await getOrCreateCart(req.sessionId);
  await db
    .update(cartItemsTable)
    .set({ quantity })
    .where(
      and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.cartId, cart.id)),
    );
  res.json(await buildCartResponse(cart.id));
});

router.delete("/cart/items/:itemId", async (req, res) => {
  const itemId = Number(req.params.itemId);
  const cart = await getOrCreateCart(req.sessionId);
  await db
    .delete(cartItemsTable)
    .where(
      and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.cartId, cart.id)),
    );
  res.json(await buildCartResponse(cart.id));
});

export default router;
