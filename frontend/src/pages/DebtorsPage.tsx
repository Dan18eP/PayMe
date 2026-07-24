import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { httpClient } from "../services/httpClient";
import type { Debtor } from "../types";

export function DebtorsPage() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", phone: "", notes: "" });
  const [error, setError] = useState("");

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const data = q
        ? await httpClient.get<Debtor[]>(`/debtors?q=${q}`)
        : await httpClient.get<Debtor[]>("/debtors");
      setDebtors(data);
    } catch { /* noop */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(search || undefined), 300); return () => clearTimeout(t); }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await httpClient.post("/debtors", formData);
      setFormData({ fullName: "", phone: "", notes: "" });
      setShowForm(false);
      load();
    } catch (err: any) { setError(err.message || "Error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar deudor y sus deudas?")) return;
    try { await httpClient.delete(`/debtors/${id}`); load(); } catch { /* noop */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-sm">
        <h2 className="text-title-lg text-on-surface">Deudores</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-xs px-md py-1.5 bg-primary text-on-primary rounded-lg text-body-sm hover:opacity-90">
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          Nuevo
        </button>
      </div>

      {showForm && (
        <div className="mb-sm bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card">
          <h3 className="text-title-md text-on-surface mb-sm">Nuevo deudor</h3>
          {error && <div className="mb-sm p-sm bg-error-container text-on-error-container rounded text-body-sm">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-sm">
            <input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
              placeholder="Nombre" required />
            <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
              placeholder="+573001234567" required />
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
              rows={2} placeholder="Notas (opcional)" />
            <div className="flex gap-sm">
              <button type="submit" className="px-md py-1.5 bg-primary text-on-primary rounded-lg text-body-sm">Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-md py-1.5 border border-outline-variant rounded-lg text-body-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative mb-sm">
        <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-[36px] pr-sm py-1.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          placeholder="Buscar por nombre..." />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md animate-pulse">
              <div className="h-4 bg-surface-container-high rounded w-24 mb-xs" />
              <div className="h-3 bg-surface-container-high rounded w-20" />
            </div>
          ))}
        </div>
      ) : debtors.length === 0 ? (
        <div className="text-center py-xl text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
          <span className="material-symbols-outlined text-[40px] text-outline">group</span>
          <p className="text-body-sm mt-xs">No hay deudores</p>
          <button onClick={() => setShowForm(true)}
            className="mt-sm px-md py-1.5 bg-primary text-on-primary rounded-lg text-body-sm inline-flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Agregar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-sm">
          {debtors.map((debtor) => (
            <div key={debtor.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card hover:border-primary/30 transition-all">
              <div className="flex items-start gap-sm mb-sm">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-secondary shrink-0">
                  {debtor.fullName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-title-md text-on-surface truncate">{debtor.fullName}</h3>
                  <p className="text-body-sm text-on-surface-variant">{debtor.phone}</p>
                </div>
              </div>
              {debtor.notes && <p className="text-body-sm text-on-surface-variant mb-sm line-clamp-2">{debtor.notes}</p>}
              <div className="flex gap-sm pt-sm border-t border-outline-variant">
                <Link to={`/debtors/${debtor.id}`}
                  className="flex-1 bg-surface-container-high text-on-surface-variant py-1 rounded-lg text-body-sm hover:bg-surface-container-highest text-center">
                  Detalles
                </Link>
                <button onClick={() => handleDelete(debtor.id)}
                  className="w-8 h-8 flex items-center justify-center bg-error-container text-on-error-container rounded-lg">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
