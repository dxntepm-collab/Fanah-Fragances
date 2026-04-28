import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT env var is required");
  let parsed: unknown = JSON.parse(raw);
  if (typeof parsed === "string") parsed = JSON.parse(parsed);
  initializeApp({ credential: cert(parsed as object) });
}
const db = getFirestore();

let counter = 0;
function genId(): number {
  counter = (counter + 1) % 1000;
  return Date.now() * 1000 + counter;
}

async function deleteCollection(name: string) {
  const snap = await db.collection(name).get();
  const batches: FirebaseFirestore.WriteBatch[] = [];
  let batch = db.batch();
  let count = 0;
  for (const doc of snap.docs) {
    batch.delete(doc.ref);
    count++;
    if (count === 400) {
      batches.push(batch);
      batch = db.batch();
      count = 0;
    }
  }
  if (count > 0) batches.push(batch);
  for (const b of batches) await b.commit();
}

async function main() {
  console.log("Seeding FANAH Fragrances to Firestore...");

  await Promise.all([
    deleteCollection("variants"),
    deleteCollection("products"),
    deleteCollection("brands"),
  ]);

  const brandData = [
    { name: "Maison Francis Kurkdjian", slug: "maison-francis-kurkdjian", country: "Francia" },
    { name: "Tom Ford", slug: "tom-ford", country: "EE.UU." },
    { name: "Chanel", slug: "chanel", country: "Francia" },
    { name: "Creed", slug: "creed", country: "Reino Unido" },
    { name: "Dior", slug: "dior", country: "Francia" },
    { name: "Carolina Herrera", slug: "carolina-herrera", country: "España" },
    { name: "Lancôme", slug: "lancome", country: "Francia" },
    { name: "Yves Saint Laurent", slug: "ysl", country: "Francia" },
    { name: "Mugler", slug: "mugler", country: "Francia" },
    { name: "Jean Paul Gaultier", slug: "jpg", country: "Francia" },
    { name: "Paco Rabanne", slug: "paco-rabanne", country: "España" },
  ];

  const brandIdBySlug: Record<string, number> = {};
  const brandNameBySlug: Record<string, string> = {};
  for (const b of brandData) {
    const id = genId();
    brandIdBySlug[b.slug] = id;
    brandNameBySlug[b.slug] = b.name;
    await db.collection("brands").doc(String(id)).set({ id, ...b });
  }

  const products = [
    { slug: "baccarat-rouge-540", brand: "maison-francis-kurkdjian", name: "Baccarat Rouge 540 Extrait", gender: "unisex", family: "Amaderada Floral",
      description: "Una alquimia luminosa que estalla en la piel: azafrán, jazmín y ámbar gris se entrelazan con cedro y musgo en una estela de oro líquido. Una de las fragancias más icónicas y reconocibles del mundo de la perfumería de nicho.",
      topNotes: ["Azafrán", "Jazmín egipcio"], heartNotes: ["Ámbar gris", "Madera de cedro"], baseNotes: ["Resina de Fir bálsamo", "Almizcle"],
      longevity: "10+ horas", sillage: "Enorme", imageUrl: "/products/baccarat.jpg", isFeatured: true, isNew: false, popularity: 100,
      variants: [{ s: 5, p: 8500 }, { s: 10, p: 15500 }, { s: 30, p: 42000 }] },
    { slug: "oud-wood", brand: "tom-ford", name: "Oud Wood", gender: "unisex", family: "Amaderada",
      description: "El oud nunca había sido tan elegante. Un encuentro silencioso entre el oud, el palo de rosa y el cardamomo, sostenido por un sándalo cremoso. Un susurro masculino y misterioso.",
      topNotes: ["Palo de rosa", "Cardamomo", "Pimienta china"], heartNotes: ["Madera de Oud", "Sándalo", "Vetiver"], baseNotes: ["Habas tonka", "Ámbar", "Vainilla"],
      longevity: "8 horas", sillage: "Moderada", imageUrl: "/products/oud-wood.jpg", isFeatured: true, isNew: false, popularity: 95,
      variants: [{ s: 5, p: 9000 }, { s: 10, p: 16500 }, { s: 30, p: 45000 }] },
    { slug: "bleu-de-chanel-parfum", brand: "chanel", name: "Bleu de Chanel Parfum", gender: "men", family: "Amaderada Aromática",
      description: "Un manifiesto de libertad. Cítricos vibrantes, incienso solemne y maderas profundas en un aroma magnético, ideal para el hombre que se mueve sin permiso.",
      topNotes: ["Toronja", "Limón", "Menta"], heartNotes: ["Jengibre", "Nuez moscada", "Iso E Super"], baseNotes: ["Sándalo", "Cedro", "Incienso"],
      longevity: "9 horas", sillage: "Fuerte", imageUrl: "/products/bleu.jpg", isFeatured: true, isNew: false, popularity: 92,
      variants: [{ s: 5, p: 5500 }, { s: 10, p: 9800 }, { s: 30, p: 26000 }] },
    { slug: "aventus", brand: "creed", name: "Aventus", gender: "men", family: "Frutal Amaderada",
      description: "La fragancia de los conquistadores. Piña ahumada, abedul y almizcle en una composición triunfal inspirada en Napoleón. Carácter, estilo y poder en cada vaporización.",
      topNotes: ["Piña", "Bergamota", "Grosella negra"], heartNotes: ["Abedul ahumado", "Pachulí", "Jazmín"], baseNotes: ["Almizcle", "Roble", "Vainilla"],
      longevity: "10+ horas", sillage: "Enorme", imageUrl: "/products/aventus.jpg", isFeatured: true, isNew: false, popularity: 98,
      variants: [{ s: 5, p: 7500 }, { s: 10, p: 13500 }, { s: 30, p: 38000 }] },
    { slug: "sauvage-elixir", brand: "dior", name: "Sauvage Elixir", gender: "men", family: "Especiada Amaderada",
      description: "La versión más concentrada de Sauvage. Lavanda, regaliz y especias se enredan con un acorde amaderado seco. Adictivo, profundo, casi narcótico.",
      topNotes: ["Canela", "Nuez moscada", "Cardamomo"], heartNotes: ["Lavanda", "Regaliz"], baseNotes: ["Sándalo", "Pachulí", "Ámbar"],
      longevity: "10 horas", sillage: "Enorme", imageUrl: "/products/sauvage.jpg", isFeatured: false, isNew: true, popularity: 88,
      variants: [{ s: 5, p: 6500 }, { s: 10, p: 12000 }, { s: 30, p: 32000 }] },
    { slug: "good-girl", brand: "carolina-herrera", name: "Good Girl", gender: "women", family: "Floral Oriental",
      description: "La luz y la sombra de toda mujer. Jazmín tuberosa, café tostado y cacao se mezclan en un frasco con forma de tacón aguja. Sensual, elegante, peligrosamente irresistible.",
      topNotes: ["Almendra", "Café", "Bergamota"], heartNotes: ["Jazmín Sambac", "Tuberosa", "Iris"], baseNotes: ["Cacao", "Habas tonka", "Sándalo"],
      longevity: "9 horas", sillage: "Fuerte", imageUrl: "/products/good-girl.jpg", isFeatured: true, isNew: false, popularity: 90,
      variants: [{ s: 5, p: 4500 }, { s: 10, p: 8200 }, { s: 30, p: 22000 }] },
    { slug: "la-vie-est-belle", brand: "lancome", name: "La Vie Est Belle", gender: "women", family: "Floral Gourmand",
      description: "Una declaración de felicidad. Iris, jazmín y praliné dulce envueltos en pachulí. La fragancia femenina más vendida del mundo por una razón: contagia alegría.",
      topNotes: ["Pera", "Grosella negra"], heartNotes: ["Iris", "Jazmín", "Flor de azahar"], baseNotes: ["Praliné", "Vainilla", "Pachulí"],
      longevity: "8 horas", sillage: "Moderada", imageUrl: "/products/la-vie.jpg", isFeatured: false, isNew: false, popularity: 85,
      variants: [{ s: 5, p: 4000 }, { s: 10, p: 7500 }, { s: 30, p: 20000 }] },
    { slug: "black-orchid", brand: "tom-ford", name: "Black Orchid", gender: "unisex", family: "Oriental Chypre",
      description: "Lujo decadente en estado puro. Trufa, orquídea negra y ámbar oscuro componen una fragancia hipnótica e indescifrable. Para quienes prefieren ser recordados.",
      topNotes: ["Trufa", "Bergamota", "Grosella negra"], heartNotes: ["Orquídea negra", "Loto", "Especias"], baseNotes: ["Pachulí", "Vainilla", "Sándalo"],
      longevity: "9 horas", sillage: "Fuerte", imageUrl: "/products/black-orchid.jpg", isFeatured: false, isNew: false, popularity: 82,
      variants: [{ s: 5, p: 6800 }, { s: 10, p: 12500 }, { s: 30, p: 33500 }] },
    { slug: "libre-intense", brand: "ysl", name: "Libre Intense", gender: "women", family: "Floral Aromática",
      description: "La libertad embotellada. Lavanda francesa y flor de azahar marroquí trenzadas con vainilla y ámbar. Una fragancia femenina con espíritu rebelde.",
      topNotes: ["Mandarina", "Lavanda francesa", "Bergamota"], heartNotes: ["Flor de azahar", "Jazmín Sambac", "Lavanda"], baseNotes: ["Vainilla bourbon", "Ámbar gris", "Cedro"],
      longevity: "9 horas", sillage: "Fuerte", imageUrl: "/products/libre.jpg", isFeatured: false, isNew: true, popularity: 78,
      variants: [{ s: 5, p: 5000 }, { s: 10, p: 9000 }, { s: 30, p: 24000 }] },
    { slug: "alien-goddess", brand: "mugler", name: "Alien Goddess", gender: "women", family: "Floral Solar",
      description: "Una deidad solar. Jazmín salvaje, vainilla bourbon y coco cremoso brillan como un amuleto luminoso. Magnetismo puro.",
      topNotes: ["Bergamota"], heartNotes: ["Jazmín Sambac", "Coco"], baseNotes: ["Vainilla bourbon", "Almizcle blanco", "Madera de cachemira"],
      longevity: "8 horas", sillage: "Moderada", imageUrl: "/products/alien.jpg", isFeatured: false, isNew: true, popularity: 76,
      variants: [{ s: 5, p: 4800 }, { s: 10, p: 8800 }, { s: 30, p: 23500 }] },
    { slug: "scandal", brand: "jpg", name: "Scandal", gender: "women", family: "Floral Gourmand",
      description: "Miel, gardenia y caramelo en una declaración seductora. Femenino, magnético y con la dosis exacta de travesura.",
      topNotes: ["Bergamota", "Mandarina"], heartNotes: ["Miel", "Gardenia", "Flor de azahar"], baseNotes: ["Caramelo", "Pachulí", "Habas tonka"],
      longevity: "8 horas", sillage: "Moderada", imageUrl: "/products/scandal.jpg", isFeatured: false, isNew: false, popularity: 74,
      variants: [{ s: 5, p: 4200 }, { s: 10, p: 7800 }, { s: 30, p: 21000 }] },
    { slug: "1-million-elixir", brand: "paco-rabanne", name: "1 Million Elixir", gender: "men", family: "Especiada Amaderada",
      description: "El lujo no se grita, se respira. Cardamomo dorado, cuero y mirra en una composición intensa y carismática. Un imán social.",
      topNotes: ["Cardamomo", "Mandarina"], heartNotes: ["Cuero", "Mirra"], baseNotes: ["Pachulí", "Habas tonka", "Ámbar"],
      longevity: "10 horas", sillage: "Fuerte", imageUrl: "/products/one-million.jpg", isFeatured: false, isNew: true, popularity: 80,
      variants: [{ s: 5, p: 4800 }, { s: 10, p: 8800 }, { s: 30, p: 23500 }] },
  ];

  for (const p of products) {
    const productId = genId();
    const brandId = brandIdBySlug[p.brand]!;
    const brandName = brandNameBySlug[p.brand]!;
    await db.collection("products").doc(String(productId)).set({
      id: productId,
      brandId,
      brandName,
      brandSlug: p.brand,
      slug: p.slug,
      name: p.name,
      gender: p.gender,
      family: p.family,
      description: p.description,
      topNotes: p.topNotes,
      heartNotes: p.heartNotes,
      baseNotes: p.baseNotes,
      longevity: p.longevity,
      sillage: p.sillage,
      imageUrl: p.imageUrl,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      popularity: p.popularity,
      createdAt: Date.now(),
    });
    for (const v of p.variants) {
      const vid = genId();
      await db.collection("variants").doc(String(vid)).set({
        id: vid,
        productId,
        sizeMl: v.s,
        priceCents: v.p,
        stock: 50,
      });
    }
  }

  console.log(`Seeded ${brandData.length} brands, ${products.length} products to Firestore.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
