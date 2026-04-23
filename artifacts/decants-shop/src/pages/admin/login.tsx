import { useState } from "react";
import { useLocation } from "wouter";
import { adminApi } from "@/lib/admin-api";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminApi.login(password);
      setLocation("/admin");
    } catch {
      setError("Contraseña incorrecta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-black text-neutral-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-white/10 bg-neutral-950 p-10"
      >
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.4em] text-[#C9A961]">FANAH</div>
          <div className="text-sm text-neutral-400 mt-2">Panel de Administración</div>
        </div>
        <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">
          Contraseña
        </label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-black border border-white/10 px-4 py-3 text-neutral-100 focus:border-[#C9A961] focus:outline-none"
        />
        {error && (
          <div className="mt-3 text-xs text-red-400">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full mt-6 bg-[#C9A961] text-black py-3 text-xs uppercase tracking-widest hover:bg-[#D4AF37] disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
