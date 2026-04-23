import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/admin-api";
import { formatPrice } from "@/lib/utils";
import { Loader2, ArrowLeft, Plus, Trash2, Save } from "lucide-react";

type Product = Awaited<ReturnType<typeof adminApi.product>>;

export default function AdminProductEdit() {
  const { id } = useParams();
  const productId = Number(id);
  const [, setLocation] = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const load = () => adminApi.product(productId).then(setProduct);

  useEffect(() => {
    load();
    adminApi.brands().then((bs) => setBrands(bs.map((b) => ({ id: b.id, name: b.name }))));
  }, [productId]);

  if (!product) {
    return (
      <AdminLayout>
        <div className="p-10">
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A961]" />
        </div>
      </AdminLayout>
    );
  }

  const update = (patch: Partial<Product>) => setProduct({ ...product, ...patch });

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateProduct(productId, {
        name: product.name,
        slug: product.slug,
        brandId: product.brandId,
        gender: product.gender,
        family: product.family,
        description: product.description,
        imageUrl: product.imageUrl,
        longevity: product.longevity ?? "",
        sillage: product.sillage ?? "",
        topNotes: product.topNotes,
        heartNotes: product.heartNotes,
        baseNotes: product.baseNotes,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        popularity: product.popularity,
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const addVariant = async () => {
    await adminApi.addVariant(productId, { sizeMl: 5, priceCents: 5000, stock: 50 });
    await load();
  };

  const deleteVariant = async (vid: number) => {
    if (!confirm("¿Eliminar esta variante?")) return;
    await adminApi.deleteVariant(vid);
    await load();
  };

  const updateVariant = async (
    vid: number,
    v: { sizeMl?: number; priceCents?: number; stock?: number },
  ) => {
    await adminApi.updateVariant(vid, v);
    await load();
  };

  return (
    <AdminLayout>
      <div className="p-10 max-w-5xl">
        <Link href="/admin/productos" className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1 mb-6">
          <ArrowLeft className="w-3 h-3" /> Volver
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-serif text-[#C9A961]">{product.name}</h1>
          <button
            onClick={() => {
              if (confirm("¿Eliminar este perfume?")) {
                adminApi.deleteProduct(productId).then(() => setLocation("/admin/productos"));
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Eliminar perfume
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Field label="Nombre" value={product.name} onChange={(v) => update({ name: v })} />
          <Field label="Slug" value={product.slug} onChange={(v) => update({ slug: v })} />
          <SelectField
            label="Marca"
            value={String(product.brandId)}
            onChange={(v) => update({ brandId: Number(v) })}
            options={brands.map((b) => ({ value: String(b.id), label: b.name }))}
          />
          <SelectField
            label="Género"
            value={product.gender}
            onChange={(v) => update({ gender: v })}
            options={[
              { value: "men", label: "Hombre" },
              { value: "women", label: "Mujer" },
              { value: "unisex", label: "Unisex" },
            ]}
          />
          <Field label="Familia olfativa" value={product.family} onChange={(v) => update({ family: v })} />
          <Field label="URL de imagen" value={product.imageUrl} onChange={(v) => update({ imageUrl: v })} />
          <Field label="Longevidad" value={product.longevity ?? ""} onChange={(v) => update({ longevity: v })} />
          <Field label="Sillage" value={product.sillage ?? ""} onChange={(v) => update({ sillage: v })} />
        </div>

        <div className="mt-6">
          <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Descripción</label>
          <textarea
            value={product.description}
            onChange={(e) => update({ description: e.target.value })}
            rows={4}
            className="w-full bg-black border border-white/10 px-3 py-2 text-neutral-200 focus:border-[#C9A961] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <NotesField label="Notas de salida" notes={product.topNotes} onChange={(v) => update({ topNotes: v })} />
          <NotesField label="Notas de corazón" notes={product.heartNotes} onChange={(v) => update({ heartNotes: v })} />
          <NotesField label="Notas de fondo" notes={product.baseNotes} onChange={(v) => update({ baseNotes: v })} />
        </div>

        <div className="flex gap-6 mt-6 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={product.isFeatured} onChange={(e) => update({ isFeatured: e.target.checked })} />
            Destacado
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={product.isNew} onChange={(e) => update({ isNew: e.target.checked })} />
            Nuevo
          </label>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Popularidad:</span>
            <input
              type="number"
              value={product.popularity}
              onChange={(e) => update({ popularity: Number(e.target.value) })}
              className="w-20 bg-black border border-white/10 px-2 py-1 text-neutral-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={save}
            disabled={saving}
            className="bg-[#C9A961] text-black px-6 py-3 text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#D4AF37] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar cambios
          </button>
          {savedAt && <span className="text-xs text-neutral-500">Guardado</span>}
        </div>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm uppercase tracking-widest text-neutral-400">Variantes (decants)</h2>
            <button
              onClick={addVariant}
              className="text-xs text-[#C9A961] hover:text-[#D4AF37] flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Agregar variante
            </button>
          </div>
          {product.variants.length === 0 ? (
            <p className="text-sm text-neutral-500">Sin variantes. Agrega al menos una.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-neutral-500">
                <tr className="border-b border-white/10">
                  <th className="text-left py-2">Tamaño (ml)</th>
                  <th className="text-left">Precio (S/)</th>
                  <th className="text-left">Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => (
                  <VariantRow key={v.id} variant={v} onSave={updateVariant} onDelete={deleteVariant} />
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

function VariantRow({
  variant,
  onSave,
  onDelete,
}: {
  variant: { id: number; sizeMl: number; priceCents: number; stock: number };
  onSave: (id: number, v: { sizeMl?: number; priceCents?: number; stock?: number }) => Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [sizeMl, setSizeMl] = useState(variant.sizeMl);
  const [priceSoles, setPriceSoles] = useState((variant.priceCents / 100).toFixed(2));
  const [stock, setStock] = useState(variant.stock);
  const dirty =
    sizeMl !== variant.sizeMl ||
    Math.round(parseFloat(priceSoles) * 100) !== variant.priceCents ||
    stock !== variant.stock;
  return (
    <tr className="border-b border-white/5">
      <td className="py-2 pr-2">
        <input type="number" className="bg-transparent border border-white/10 px-2 py-1 w-24 text-neutral-200" value={sizeMl} onChange={(e) => setSizeMl(Number(e.target.value))} />
      </td>
      <td className="py-2 pr-2">
        <input type="number" step="0.01" className="bg-transparent border border-white/10 px-2 py-1 w-28 text-neutral-200" value={priceSoles} onChange={(e) => setPriceSoles(e.target.value)} />
        <span className="text-xs text-neutral-500 ml-2">{formatPrice(Math.round(parseFloat(priceSoles || "0") * 100))}</span>
      </td>
      <td className="py-2 pr-2">
        <input type="number" className="bg-transparent border border-white/10 px-2 py-1 w-20 text-neutral-200" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
      </td>
      <td className="py-2 text-right whitespace-nowrap">
        {dirty && (
          <button
            onClick={() =>
              onSave(variant.id, { sizeMl, priceCents: Math.round(parseFloat(priceSoles) * 100), stock })
            }
            className="text-[#C9A961] mr-3"
            title="Guardar"
          >
            <Save className="w-4 h-4 inline" />
          </button>
        )}
        <button onClick={() => onDelete(variant.id)} className="text-neutral-500 hover:text-red-400">
          <Trash2 className="w-4 h-4 inline" />
        </button>
      </td>
    </tr>
  );
}

function NotesField({
  label,
  notes,
  onChange,
}: {
  label: string;
  notes: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">{label}</label>
      <textarea
        value={notes.join(", ")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        rows={3}
        placeholder="bergamota, mandarina, ..."
        className="w-full bg-black border border-white/10 px-3 py-2 text-neutral-200 text-sm focus:border-[#C9A961] focus:outline-none"
      />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-white/10 px-3 py-2 text-neutral-200 focus:border-[#C9A961] focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-white/10 px-3 py-2 text-neutral-200 focus:border-[#C9A961] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
