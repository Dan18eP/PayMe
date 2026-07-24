import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { httpClient } from "../services/httpClient";
import type { Debt } from "../types";

export function RegisterPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDebtId = searchParams.get("debtId");

  const [debts, setDebts] = useState<{ debts: Debt; debtors: { fullName: string } }[]>([]);
  const [formData, setFormData] = useState({ debtId: preselectedDebtId || "", amount: "", notes: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { httpClient.get<{ debts: Debt; debtors: { fullName: string } }[]>("/debts").then(setDebts).catch(() => {}); }, []);

  const selectedDebt = debts.find((d) => d.debts.id === formData.debtId);
  const remaining = selectedDebt ? Number(selectedDebt.debts.remainingBalance) : 0;
  const isFullSettlement = selectedDebt && Number(formData.amount) >= remaining;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedDebt) return;
    if (Number(formData.amount) > remaining) {
      setError(`El abono excede el saldo de ${remaining.toLocaleString("es-CO")}`);
      return;
    }
    setLoading(true);
    try {
      await httpClient.post("/payments", { debtId: formData.debtId, amount: formData.amount, notes: formData.notes, isFullSettlement });
      setSuccess(true);
      setTimeout(() => navigate(`/debts/${formData.debtId}`), 1500);
    } catch (err: any) { setError(err.message || "Error"); } finally { setLoading(false); }
  };

  const fmt = (v: string) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(v));

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-xl">
        <span className="material-symbols-outlined text-[48px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <p className="text-title-md text-on-surface mt-sm">¡Pago registrado!</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Link to={`/debts/${formData.debtId || ""}`} className="text-primary text-body-sm hover:underline flex items-center gap-xs mb-sm">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Volver
      </Link>

      <h2 className="text-title-lg text-on-surface mb-sm">Registrar abono</h2>

      {error && <div className="mb-sm p-sm bg-error-container text-on-error-container rounded text-body-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card space-y-sm">
        <div>
          <label className="text-label-md text-on-surface-variant mb-0.5 block">Deuda</label>
          <select value={formData.debtId} onChange={(e) => setFormData({ ...formData, debtId: e.target.value, amount: "" })}
            className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary" required>
            <option value="">Seleccionar</option>
            {debts.filter((d) => d.debts.status !== "paid" && d.debts.status !== "cancelled").map((d) => (
              <option key={d.debts.id} value={d.debts.id}>{d.debtors.fullName} · {fmt(d.debts.remainingBalance)}</option>
            ))}
          </select>
        </div>

        {selectedDebt && (
          <div className="p-sm bg-surface-container rounded-lg text-body-sm">
            Saldo: <strong>{fmt(selectedDebt.debts.remainingBalance)}</strong>
          </div>
        )}

        <div>
          <label className="text-label-md text-on-surface-variant mb-0.5 block">Monto</label>
          <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
            placeholder="100000" required min={1} max={remaining || undefined} />
        </div>

        <div>
          <label className="text-label-md text-on-surface-variant mb-0.5 block">Notas (opcional)</label>
          <input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
            placeholder="Ej: Abono quincenal" />
        </div>

        {isFullSettlement && (
          <div className="p-sm bg-tertiary-container/50 text-tertiary rounded text-body-sm flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Este pago liquida la deuda.
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-1.5 bg-primary text-on-primary rounded-lg text-body-sm disabled:opacity-50 flex items-center justify-center gap-xs">
          <span className="material-symbols-outlined text-[16px]">payments</span>
          {loading ? "Registrando..." : isFullSettlement ? "Pagar y liquidar" : "Registrar abono"}
        </button>
      </form>
    </div>
  );
}
