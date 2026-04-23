import { Router, type IRouter } from "express";
import { fdb, genId } from "../lib/firestore";
import crypto from "node:crypto";

const router: IRouter = Router();

type OrderItem = {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  brand: string;
  sizeMl: number;
  imageUrl: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
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
  items: OrderItem[];
  createdAt: number;
};

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

function serialize(o: OrderDoc) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    shippingAddress: o.shippingAddress,
    city: o.city,
    shippingMethod: o.shippingMethod,
    paymentMethod: o.paymentMethod,
    notes: o.notes ?? undefined,
    subtotalCents: o.subtotalCents,
    shippingCents: o.shippingCents,
    totalCents: o.totalCents,
    items: o.items,
    createdAt: new Date(o.createdAt).toISOString(),
  };
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

  const cartRef = fdb().collection("carts").doc(req.sessionId);
  const cartSnap = await cartRef.get();
  if (!cartSnap.exists) {
    res.status(400).json({ error: "empty_cart" });
    return;
  }
  const cart = cartSnap.data() as {
    items: { id: number; variantId: number; quantity: number }[];
  };
  if (!cart.items?.length) {
    res.status(400).json({ error: "empty_cart" });
    return;
  }

  const variantSnaps = await Promise.all(
    cart.items.map((i) =>
      fdb()
        .collection("variants")
        .where("id", "==", i.variantId)
        .limit(1)
        .get(),
    ),
  );
  const productSnaps = await Promise.all(
    variantSnaps.map((s) => {
      if (s.empty) return null;
      const v = s.docs[0]!.data() as { productId: number };
      return fdb()
        .collection("products")
        .where("id", "==", v.productId)
        .limit(1)
        .get();
    }),
  );

  const items: OrderItem[] = [];
  for (let i = 0; i < cart.items.length; i++) {
    const vs = variantSnaps[i];
    const ps = productSnaps[i];
    if (!vs || vs.empty || !ps || ps.empty) continue;
    const v = vs.docs[0]!.data() as {
      id: number;
      productId: number;
      sizeMl: number;
      priceCents: number;
    };
    const p = ps.docs[0]!.data() as {
      id: number;
      slug: string;
      name: string;
      brandName: string;
      imageUrl: string;
    };
    const cartItem = cart.items[i]!;
    items.push({
      id: genId(),
      variantId: v.id,
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      brand: p.brandName,
      sizeMl: v.sizeMl,
      imageUrl: p.imageUrl,
      unitPriceCents: v.priceCents,
      quantity: cartItem.quantity,
      lineTotalCents: v.priceCents * cartItem.quantity,
    });
  }

  if (!items.length) {
    res.status(400).json({ error: "empty_cart" });
    return;
  }

  const subtotalCents = items.reduce((s, i) => s + i.lineTotalCents, 0);
  const shippingCents = shippingCostCents(body.shippingMethod);
  const totalCents = subtotalCents + shippingCents;

  const orderNumber = `FA-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;

  const order: OrderDoc = {
    id: genId(),
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
    items,
    createdAt: Date.now(),
  };

  await fdb().collection("orders").doc(orderNumber).set(order);
  await cartRef.set({ items: [], updatedAt: Date.now() });

  res.json(serialize(order));
});

router.get("/orders/:orderNumber", async (req, res) => {
  const snap = await fdb()
    .collection("orders")
    .doc(req.params.orderNumber)
    .get();
  if (!snap.exists) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(serialize(snap.data() as OrderDoc));
});

export default router;
