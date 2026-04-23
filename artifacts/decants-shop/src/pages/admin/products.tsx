import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/admin-api";
import { Loader2, Plus, Trash2, Edit, Star, Sparkles } from "lucide-react";

type Row = Awaited<ReturnType<typeof adminApi.products>>[number];

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Row[] | null>(null);
  const load = () => adminApi.products().then(setProducts);
  useEffect(() => {
    load();
  }, []);

  const handleNew = async () => {
    const brands = await adminApi.brands();
    if (brands.length === 0) {
      alert("Primero crea una marca.");
      return;
    }
    const slug = `nuevo-perfume-${Date.now()}`;
    const p = await adminApi.createProduct({
      name: "Nuevo perfume",
      slug,
      brandId: brands[0]!.id,
      gender: "unisex",
      family: "Oriental",
      description: "",
      imageUrl: "/products/placeholder.jpg",
    });
    setLocation(`/admin/productos/${p.id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este perfume y todas sus variantes?")) return;
    await adminApi.deleteProduct(id);
    await load();
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-serif text-[#C9A961]">Perfumes</h1>
          <button
            onClick={handleNew}
            className="bg-[#C9A961] text-black px-5 py-2 text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#D4AF37]"
          >
            <Plus className="w-4 h-4" /> Nuevo perfume
          </button>
        </div>

        {!products ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A961]" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-neutral-500">
              <tr className="border-b border-white/10">
                <th className="text-left py-3 w-16"></th>
                <th className="text-left">Nombre</th>
                <th className="text-left">Marca</th>
                <th className="text-left">Género</th>
                <th className="text-left">Familia</th>
                <th className="text-center">Destacado</th>
                <th className="text-center">Nuevo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2">
                    <img src={p.imageUrl} alt="" className="w-12 h-12 object-cover bg-neutral-900" />
                  </td>
                  <td className="text-neutral-200">
                    <Link href={`/admin/productos/${p.id}`} className="hover:text-[#C9A961]">
                      {p.name}
                    </Link>
                    <div className="text-xs text-neutral-500">{p.slug}</div>
                  </td>
                  <td className="text-neutral-400">{p.brand}</td>
                  <td className="text-neutral-400">{p.gender}</td>
                  <td className="text-neutral-400">{p.family}</td>
                  <td className="text-center">{p.isFeatured && <Star className="w-4 h-4 text-[#C9A961] inline" />}</td>
                  <td className="text-center">{p.isNew && <Sparkles className="w-4 h-4 text-[#C9A961] inline" />}</td>
                  <td className="text-right whitespace-nowrap pr-2">
                    <Link href={`/admin/productos/${p.id}`} className="text-[#C9A961] mr-3" title="Editar">
                      <Edit className="w-4 h-4 inline" />
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="text-neutral-500 hover:text-red-400" title="Eliminar">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
