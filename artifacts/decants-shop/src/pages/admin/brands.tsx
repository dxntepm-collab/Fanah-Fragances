import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/admin-api";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

type Brand = Awaited<ReturnType<typeof adminApi.brands>>[number];

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [newBrand, setNewBrand] = useState({ name: "", slug: "", country: "" });
  const [error, setError] = useState<string | null>(null);

  const load = () => adminApi.brands().then(setBrands);
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await adminApi.createBrand(newBrand);
      setNewBrand({ name: "", slug: "", country: "" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta marca?")) return;
    try {
      await adminApi.deleteBrand(id);
      await load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <AdminLayout>
      <div className="p-10 max-w-5xl">
        <h1 className="text-2xl font-serif text-[#C9A961] mb-8">Marcas</h1>

        <form
          onSubmit={handleCreate}
          className="border border-white/10 p-6 mb-8 grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end"
        >
          <Field label="Nombre" value={newBrand.name} onChange={(v) => setNewBrand({ ...newBrand, name: v })} />
          <Field label="Slug" value={newBrand.slug} onChange={(v) => setNewBrand({ ...newBrand, slug: v })} />
          <Field label="País" value={newBrand.country} onChange={(v) => setNewBrand({ ...newBrand, country: v })} />
          <button
            type="submit"
            className="bg-[#C9A961] text-black px-5 py-2 text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#D4AF37]"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
          {error && <div className="col-span-4 text-xs text-red-400">{error}</div>}
        </form>

        {!brands ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A961]" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-neutral-500">
              <tr className="border-b border-white/10">
                <th className="text-left py-3">Nombre</th>
                <th className="text-left">Slug</th>
                <th className="text-left">País</th>
                <th className="text-right">Productos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <BrandRow key={b.id} brand={b} onChanged={load} onDelete={() => handleDelete(b.id)} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

function BrandRow({ brand, onChanged, onDelete }: { brand: Brand; onChanged: () => void; onDelete: () => void }) {
  const [name, setName] = useState(brand.name);
  const [slug, setSlug] = useState(brand.slug);
  const [country, setCountry] = useState(brand.country ?? "");
  const dirty = name !== brand.name || slug !== brand.slug || country !== (brand.country ?? "");

  const save = async () => {
    await adminApi.updateBrand(brand.id, { name, slug, country });
    onChanged();
  };

  return (
    <tr className="border-b border-white/5">
      <td className="py-2 pr-2">
        <input className="bg-transparent border border-white/10 px-2 py-1 w-full text-neutral-200" value={name} onChange={(e) => setName(e.target.value)} />
      </td>
      <td className="py-2 pr-2">
        <input className="bg-transparent border border-white/10 px-2 py-1 w-full text-neutral-200" value={slug} onChange={(e) => setSlug(e.target.value)} />
      </td>
      <td className="py-2 pr-2">
        <input className="bg-transparent border border-white/10 px-2 py-1 w-full text-neutral-200" value={country} onChange={(e) => setCountry(e.target.value)} />
      </td>
      <td className="py-2 text-right text-neutral-400">{brand.productCount}</td>
      <td className="py-2 text-right whitespace-nowrap">
        {dirty && (
          <button onClick={save} className="text-[#C9A961] hover:text-[#D4AF37] mr-3" title="Guardar">
            <Save className="w-4 h-4 inline" />
          </button>
        )}
        <button onClick={onDelete} className="text-neutral-500 hover:text-red-400" title="Eliminar">
          <Trash2 className="w-4 h-4 inline" />
        </button>
      </td>
    </tr>
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
