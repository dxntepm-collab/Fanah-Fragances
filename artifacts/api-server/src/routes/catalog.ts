import { Router, type IRouter } from "express";
import { fdb } from "../lib/firestore";

const router: IRouter = Router();

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

type BrandDoc = {
  id: number;
  name: string;
  slug: string;
  country?: string | null;
};

async function loadAll() {
  const [productsSnap, variantsSnap, brandsSnap] = await Promise.all([
    fdb().collection("products").get(),
    fdb().collection("variants").get(),
    fdb().collection("brands").get(),
  ]);
  const products = productsSnap.docs.map((d) => d.data() as ProductDoc);
  const variants = variantsSnap.docs.map((d) => d.data() as VariantDoc);
  const brands = brandsSnap.docs.map((d) => d.data() as BrandDoc);
  return { products, variants, brands };
}

function variantsForProduct(variants: VariantDoc[], productId: number) {
  return variants
    .filter((v) => v.productId === productId)
    .sort((a, b) => a.sizeMl - b.sizeMl);
}

function toProductCard(p: ProductDoc, variants: VariantDoc[]) {
  const vs = variantsForProduct(variants, p.id);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brandName,
    brandSlug: p.brandSlug,
    gender: p.gender,
    family: p.family,
    imageUrl: p.imageUrl,
    fromPriceCents: vs.length ? Math.min(...vs.map((v) => v.priceCents)) : 0,
    sizesMl: vs.map((v) => v.sizeMl),
    isFeatured: p.isFeatured,
    isNew: p.isNew,
  };
}

router.get("/brands", async (_req, res) => {
  const { products, brands } = await loadAll();
  const productCount = (brandId: number) =>
    products.filter((p) => p.brandId === brandId).length;
  res.json(
    brands
      .map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        country: b.country ?? undefined,
        productCount: productCount(b.id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  );
});

router.get("/products", async (req, res) => {
  const { gender, brand, family, search, sort } = req.query as Record<
    string,
    string | undefined
  >;
  const { products, variants } = await loadAll();
  let filtered = products;
  if (gender) filtered = filtered.filter((p) => p.gender === gender);
  if (family) filtered = filtered.filter((p) => p.family === family);
  if (brand) filtered = filtered.filter((p) => p.brandSlug === brand);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q),
    );
  }

  const cards = filtered.map((p) => toProductCard(p, variants));
  switch (sort) {
    case "price_asc":
      cards.sort((a, b) => a.fromPriceCents - b.fromPriceCents);
      break;
    case "price_desc":
      cards.sort((a, b) => b.fromPriceCents - a.fromPriceCents);
      break;
    case "popular":
      cards.sort(
        (a, b) =>
          (filtered.find((p) => p.id === b.id)?.popularity ?? 0) -
          (filtered.find((p) => p.id === a.id)?.popularity ?? 0),
      );
      break;
    case "newest":
    default:
      cards.sort(
        (a, b) =>
          (filtered.find((p) => p.id === b.id)?.createdAt ?? 0) -
          (filtered.find((p) => p.id === a.id)?.createdAt ?? 0),
      );
  }
  res.json(cards);
});

router.get("/products/featured", async (_req, res) => {
  const { products, variants } = await loadAll();
  const list = products
    .filter((p) => p.isFeatured)
    .sort((a, b) => b.popularity - a.popularity)
    .map((p) => toProductCard(p, variants));
  res.json(list);
});

router.get("/products/bestsellers", async (_req, res) => {
  const { products, variants } = await loadAll();
  const list = products
    .slice()
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8)
    .map((p) => toProductCard(p, variants));
  res.json(list);
});

router.get("/products/new-arrivals", async (_req, res) => {
  const { products, variants } = await loadAll();
  const list = products
    .filter((p) => p.isNew)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((p) => toProductCard(p, variants));
  res.json(list);
});

router.get("/products/:slug", async (req, res) => {
  const slug = req.params.slug;
  const snap = await fdb()
    .collection("products")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const p = snap.docs[0]!.data() as ProductDoc;
  const variantsSnap = await fdb()
    .collection("variants")
    .where("productId", "==", p.id)
    .get();
  const variants = variantsSnap.docs
    .map((d) => d.data() as VariantDoc)
    .sort((a, b) => a.sizeMl - b.sizeMl);
  const fromPriceCents = variants.length
    ? Math.min(...variants.map((v) => v.priceCents))
    : 0;

  res.json({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brandName,
    brandSlug: p.brandSlug,
    gender: p.gender,
    family: p.family,
    imageUrl: p.imageUrl,
    fromPriceCents,
    sizesMl: variants.map((v) => v.sizeMl),
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    description: p.description,
    topNotes: p.topNotes,
    heartNotes: p.heartNotes,
    baseNotes: p.baseNotes,
    longevity: p.longevity ?? undefined,
    sillage: p.sillage ?? undefined,
    variants: variants.map((v) => ({
      id: v.id,
      sizeMl: v.sizeMl,
      priceCents: v.priceCents,
      stock: v.stock,
    })),
  });
});

router.get("/catalog/summary", async (_req, res) => {
  const { products, brands } = await loadAll();
  const byGender: Record<string, number> = {};
  const byFamily: Record<string, number> = {};
  for (const p of products) {
    byGender[p.gender] = (byGender[p.gender] ?? 0) + 1;
    byFamily[p.family] = (byFamily[p.family] ?? 0) + 1;
  }
  const productCount = (brandId: number) =>
    products.filter((p) => p.brandId === brandId).length;
  const topBrands = brands
    .map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      country: b.country ?? undefined,
      productCount: productCount(b.id),
    }))
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 8);
  res.json({
    totalProducts: products.length,
    totalBrands: brands.length,
    byGender: Object.entries(byGender).map(([gender, count]) => ({
      gender,
      count,
    })),
    byFamily: Object.entries(byFamily)
      .map(([family, count]) => ({ family, count }))
      .sort((a, b) => b.count - a.count),
    topBrands,
  });
});

export default router;
