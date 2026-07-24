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
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search || undefined), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await httpClient.post("/debtors", formData);
      setFormData({ fullName: "", phone: "", notes: "" });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message || "Error al crear deudor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este deudor y todas sus deudas?")) return;
    try {
      await httpClient.delete(`/debtors/${id}`);
      load();
    } catch {
      /* noop */
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-headline-lg text-on-surface">Deudores</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-xs px-lg py-md bg-primary text-on-primary rounded-xl text-title-md hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">person_add</span>
          Nuevo Deudor
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-lg bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card">
          <h3 className="text-title-lg text-on-surface mb-md">Nuevo Deudor</h3>
          {error && (
            <div className="mb-md p-md bg-error-container text-on-error-container rounded-lg text-body-sm">{error}</div>
          )}
          <form onSubmit={handleCreate} className="space-y-md">
            <div>
              <label className="text-label-md text-on-surface-variant">Nombre completo</label>
              <input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
                placeholder="Nombre del deudor"
                required
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant">Teléfono</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
                placeholder="+573001234567"
                required
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant">Notas (opcional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
                rows={2}
              />
            </div>
            <div className="flex gap-sm">
              <button type="submit" className="px-lg py-md bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90">
                Guardar
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-lg py-md border border-outline-variant rounded-lg text-title-md text-on-surface-variant hover:bg-surface-container-high">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-lg">
        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-md py-md bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-body-md text-on-surface"
          placeholder="Buscar por nombre..."
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg animate-pulse">
              <div className="h-6 bg-surface-container-high rounded w-32 mb-sm" />
              <div className="h-4 bg-surface-container-high rounded w-24" />
            </div>
          ))}
        </div>
      ) : debtors.length === 0 ? (
        <div className="text-center py-2xl text-on-surface-variant">
          <span className="material-symbols-outlined text-[64px] text-outline">group</span>
          <p className="text-body-lg mt-md">No hay deudores registrados</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-md px-lg py-md bg-primary text-on-primary rounded-xl inline-flex items-center gap-xs"
          >
            <span className="material-symbols-outlined">person_add</span>
            Agregar primer deudor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {debtors.map((debtor) => (
            <div
              key={debtor.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card hover:border-primary/30 transition-all flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-md">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center font-bold text-secondary">
                    {debtor.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-title-lg text-on-surface">{debtor.fullName}</h3>
                    <p className="text-label-md text-on-surface-variant">{debtor.phone}</p>
                  </div>
                </div>
              </div>
              {debtor.notes && (
                <p className="text-body-sm text-on-surface-variant mb-lg line-clamp-2">{debtor.notes}</p>
              )}
              <div className="flex items-center gap-sm pt-md border-t border-outline-variant">
                <Link
                  to={`/debtors/${debtor.id}`}
                  className="flex-1 bg-surface-container-high text-on-surface-variant py-sm rounded-lg text-title-md hover:bg-surface-container-highest transition-colors text-center"
                >
                  Ver Detalles
                </Link>
                <button
                  onClick={() => handleDelete(debtor.id)}
                  className="w-10 h-10 flex items-center justify-center bg-error-container text-on-error-container rounded-lg hover:opacity-80 transition-opacity"
                  title="Eliminar"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
