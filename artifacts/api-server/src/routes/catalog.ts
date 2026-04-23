import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  brandsTable,
  productsTable,
  variantsTable,
} from "@workspace/db";
import { eq, and, ilike, or, sql, desc, asc, min, count } from "drizzle-orm";

const router: IRouter = Router();

async function loadProductsWithVariants(
  whereExpr?: ReturnType<typeof and>,
  orderExpr?: ReturnType<typeof asc> | ReturnType<typeof desc>,
) {
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
      brand: brandsTable.name,
      brandSlug: brandsTable.slug,
      fromPriceCents: min(variantsTable.priceCents),
      sizesMl: sql<number[]>`array_agg(${variantsTable.sizeMl} order by ${variantsTable.sizeMl})`,
    })
    .from(productsTable)
    .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
    .innerJoin(variantsTable, eq(variantsTable.productId, productsTable.id))
    .where(whereExpr)
    .groupBy(productsTable.id, brandsTable.id)
    .orderBy(orderExpr ?? desc(productsTable.createdAt));

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    brandSlug: r.brandSlug,
    gender: r.gender,
    family: r.family,
    imageUrl: r.imageUrl,
    fromPriceCents: r.fromPriceCents ?? 0,
    sizesMl: r.sizesMl ?? [],
    isFeatured: r.isFeatured,
    isNew: r.isNew,
  }));
}

router.get("/brands", async (_req, res) => {
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
      country: r.country ?? undefined,
      productCount: Number(r.productCount),
    })),
  );
});

router.get("/products", async (req, res) => {
  const { gender, brand, family, search, sort } = req.query as Record<
    string,
    string | undefined
  >;
  const filters = [];
  if (gender) filters.push(eq(productsTable.gender, gender));
  if (family) filters.push(eq(productsTable.family, family));
  if (brand) filters.push(eq(brandsTable.slug, brand));
  if (search) {
    filters.push(
      or(
        ilike(productsTable.name, `%${search}%`),
        ilike(brandsTable.name, `%${search}%`),
      )!,
    );
  }
  const whereExpr = filters.length ? and(...filters) : undefined;

  let orderExpr;
  switch (sort) {
    case "price_asc":
      orderExpr = asc(min(variantsTable.priceCents));
      break;
    case "price_desc":
      orderExpr = desc(min(variantsTable.priceCents));
      break;
    case "popular":
      orderExpr = desc(productsTable.popularity);
      break;
    case "newest":
    default:
      orderExpr = desc(productsTable.createdAt);
  }

  const products = await loadProductsWithVariants(whereExpr, orderExpr);
  res.json(products);
});

router.get("/products/featured", async (_req, res) => {
  const products = await loadProductsWithVariants(
    eq(productsTable.isFeatured, true),
    desc(productsTable.popularity),
  );
  res.json(products);
});

router.get("/products/bestsellers", async (_req, res) => {
  const products = await loadProductsWithVariants(
    undefined,
    desc(productsTable.popularity),
  );
  res.json(products.slice(0, 8));
});

router.get("/products/new-arrivals", async (_req, res) => {
  const products = await loadProductsWithVariants(
    eq(productsTable.isNew, true),
    desc(productsTable.createdAt),
  );
  res.json(products);
});

router.get("/products/:slug", async (req, res) => {
  const slug = req.params.slug;
  const productRow = await db
    .select({
      product: productsTable,
      brand: brandsTable.name,
      brandSlug: brandsTable.slug,
    })
    .from(productsTable)
    .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
    .where(eq(productsTable.slug, slug))
    .limit(1);

  if (!productRow.length) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const { product, brand, brandSlug } = productRow[0]!;
  const variants = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.productId, product.id))
    .orderBy(asc(variantsTable.sizeMl));

  const fromPriceCents = variants.length
    ? Math.min(...variants.map((v) => v.priceCents))
    : 0;

  res.json({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand,
    brandSlug,
    gender: product.gender,
    family: product.family,
    imageUrl: product.imageUrl,
    fromPriceCents,
    sizesMl: variants.map((v) => v.sizeMl),
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    description: product.description,
    topNotes: product.topNotes,
    heartNotes: product.heartNotes,
    baseNotes: product.baseNotes,
    longevity: product.longevity ?? undefined,
    sillage: product.sillage ?? undefined,
    variants: variants.map((v) => ({
      id: v.id,
      sizeMl: v.sizeMl,
      priceCents: v.priceCents,
      stock: v.stock,
    })),
  });
});

router.get("/catalog/summary", async (_req, res) => {
  const [totalProductsRow] = await db
    .select({ c: count() })
    .from(productsTable);
  const [totalBrandsRow] = await db.select({ c: count() }).from(brandsTable);

  const byGender = await db
    .select({
      gender: productsTable.gender,
      count: count(),
    })
    .from(productsTable)
    .groupBy(productsTable.gender);

  const byFamily = await db
    .select({
      family: productsTable.family,
      count: count(),
    })
    .from(productsTable)
    .groupBy(productsTable.family)
    .orderBy(desc(count()));

  const topBrandsRows = await db
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
    .orderBy(desc(count(productsTable.id)))
    .limit(8);

  res.json({
    totalProducts: Number(totalProductsRow?.c ?? 0),
    totalBrands: Number(totalBrandsRow?.c ?? 0),
    byGender: byGender.map((r) => ({
      gender: r.gender,
      count: Number(r.count),
    })),
    byFamily: byFamily.map((r) => ({
      family: r.family,
      count: Number(r.count),
    })),
    topBrands: topBrandsRows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      country: r.country ?? undefined,
      productCount: Number(r.productCount),
    })),
  });
});

export default router;
