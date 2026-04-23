import { Router, type IRouter } from "express";
import { fdb, genId } from "../lib/firestore";

const router: IRouter = Router();

type CartItem = { id: number; variantId: number; quantity: number };
type CartDoc = { items: CartItem[]; updatedAt: number };

type ProductDoc = {
  id: number;
  brandName: string;
  slug: string;
  name: string;
  imageUrl: string;
};
type VariantDoc = {
  id: number;
  productId: number;
  sizeMl: number;
  priceCents: number;
};

async function getCart(sessionId: string): Promise<CartDoc> {
  const ref = fdb().collection("carts").doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists) {
    const empty: CartDoc = { items: [], updatedAt: Date.now() };
    await ref.set(empty);
    return empty;
  }
  return snap.data() as CartDoc;
}

async function saveCart(sessionId: string, cart: CartDoc) {
  await fdb()
    .collection("carts")
    .doc(sessionId)
    .set({ ...cart, updatedAt: Date.now() });
}

async function buildResponse(cart: CartDoc) {
  if (cart.items.length === 0) {
    return { items: [], subtotalCents: 0, itemCount: 0 };
  }
  const variantIds = [...new Set(cart.items.map((i) => i.variantId))];
  const variantSnaps = await Promise.all(
    variantIds.map((id) =>
      fdb()
        .collection("variants")
        .where("id", "==", id)
        .limit(1)
        .get(),
    ),
  );
  const variantsById = new Map<number, VariantDoc>();
  variantSnaps.forEach((s) => {
    if (!s.empty) {
      const v = s.docs[0]!.data() as VariantDoc;
      variantsById.set(v.id, v);
    }
  });

  const productIds = [
    ...new Set(
      [...variantsById.values()].map((v) => v.productId),
    ),
  ];
  const productSnaps = await Promise.all(
    productIds.map((id) =>
      fdb()
        .collection("products")
        .where("id", "==", id)
        .limit(1)
        .get(),
    ),
  );
  const productsById = new Map<number, ProductDoc>();
  productSnaps.forEach((s) => {
    if (!s.empty) {
      const p = s.docs[0]!.data() as ProductDoc;
      productsById.set(p.id, p);
    }
  });

  const items = cart.items
    .map((it) => {
      const v = variantsById.get(it.variantId);
      if (!v) return null;
      const p = productsById.get(v.productId);
      if (!p) return null;
      return {
        id: it.id,
        variantId: v.id,
        productId: p.id,
        productName: p.name,
        productSlug: p.slug,
        brand: p.brandName,
        sizeMl: v.sizeMl,
        imageUrl: p.imageUrl,
        unitPriceCents: v.priceCents,
        quantity: it.quantity,
        lineTotalCents: v.priceCents * it.quantity,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotalCents = items.reduce((s, i) => s + i.lineTotalCents, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  return { items, subtotalCents, itemCount };
}

router.get("/cart", async (req, res) => {
  const cart = await getCart(req.sessionId);
  res.json(await buildResponse(cart));
});

router.delete("/cart", async (req, res) => {
  const cart = await getCart(req.sessionId);
  cart.items = [];
  await saveCart(req.sessionId, cart);
  res.json(await buildResponse(cart));
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
  const cart = await getCart(req.sessionId);
  const existing = cart.items.find((i) => i.variantId === variantId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ id: genId(), variantId, quantity });
  }
  await saveCart(req.sessionId, cart);
  res.json(await buildResponse(cart));
});

router.patch("/cart/items/:itemId", async (req, res) => {
  const itemId = Number(req.params.itemId);
  const { quantity } = req.body as { quantity: number };
  if (!quantity || quantity < 1) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const cart = await getCart(req.sessionId);
  const it = cart.items.find((i) => i.id === itemId);
  if (it) it.quantity = quantity;
  await saveCart(req.sessionId, cart);
  res.json(await buildResponse(cart));
});

router.delete("/cart/items/:itemId", async (req, res) => {
  const itemId = Number(req.params.itemId);
  const cart = await getCart(req.sessionId);
  cart.items = cart.items.filter((i) => i.id !== itemId);
  await saveCart(req.sessionId, cart);
  res.json(await buildResponse(cart));
});

export default router;
