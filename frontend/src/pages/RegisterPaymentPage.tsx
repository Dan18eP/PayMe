import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { httpClient } from "../services/httpClient";
import type { Debt } from "../types";

export function RegisterPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDebtId = searchParams.get("debtId");

  const [debts, setDebts] = useState<{ debts: Debt; debtors: { fullName: string } }[]>([]);
  const [formData, setFormData] = useState({
    debtId: preselectedDebtId || "",
    amount: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    httpClient.get<{ debts: Debt; debtors: { fullName: string } }[]>("/debts")
      .then(setDebts)
      .catch(() => {});
  }, []);

  const selectedDebt = debts.find((d) => d.debts.id === formData.debtId);
  const remaining = selectedDebt ? Number(selectedDebt.debts.remainingBalance) : 0;
  const isFullSettlement = selectedDebt && Number(formData.amount) >= remaining;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedDebt) return;
    if (Number(formData.amount) > remaining) {
      setError(`El abono no puede exceder el saldo pendiente de $${remaining.toLocaleString("es-CO")}`);
      return;
    }
    setLoading(true);
    try {
      await httpClient.post("/payments", {
        debtId: formData.debtId,
        amount: formData.amount,
        notes: formData.notes,
        isFullSettlement,
      });
      setSuccess(true);
      setTimeout(() => navigate(`/debts/${formData.debtId}`), 1500);
    } catch (err: any) {
      setError(err.message || "Error al registrar pago");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: string) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(val));

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-2xl">
        <span className="material-symbols-outlined text-[64px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <h2 className="text-headline-md text-on-surface mt-md">¡Pago registrado!</h2>
        <p className="text-body-md text-on-surface-variant mt-sm">Redirigiendo al detalle de la deuda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link to={`/debts/${formData.debtId || ""}`} className="text-primary text-body-md hover:underline flex items-center gap-xs mb-lg">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver
      </Link>

      <h2 className="text-headline-lg text-on-surface mb-lg">Registrar Abono</h2>

      {error && (
        <div className="mb-md p-md bg-error-container text-on-error-container rounded-lg text-body-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card space-y-md">
        <div>
          <label className="text-label-md text-on-surface-variant">Deuda</label>
          <select
            value={formData.debtId}
            onChange={(e) => setFormData({ ...formData, debtId: e.target.value, amount: "" })}
            className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
            required
          >
            <option value="">Seleccionar deuda</option>
            {debts
              .filter((d) => d.debts.status !== "paid" && d.debts.status !== "cancelled")
              .map((d) => (
                <option key={d.debts.id} value={d.debts.id}>
                  {d.debtors.fullName} · {formatCurrency(d.debts.remainingBalance)}
                </option>
              ))}
          </select>
        </div>

        {selectedDebt && (
          <div className="p-md bg-surface-container rounded-lg">
            <p className="text-body-sm text-on-surface-variant">Saldo pendiente: <strong className="text-on-surface">{formatCurrency(selectedDebt.debts.remainingBalance)}</strong></p>
          </div>
        )}

        <div>
          <label className="text-label-md text-on-surface-variant">Monto del abono</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
            placeholder="100000"
            required
            min={1}
            max={remaining || undefined}
          />
        </div>

        <div>
          <label className="text-label-md text-on-surface-variant">Notas (opcional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
            rows={2}
            placeholder="Ej: Abono quincenal"
          />
        </div>

        {isFullSettlement && (
          <div className="p-md bg-tertiary-container/50 text-tertiary rounded-lg text-body-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">info</span>
            Este abono completará el pago total de la deuda.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-lg py-md bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-xs"
        >
          <span className="material-symbols-outlined">payments</span>
          {loading ? "Registrando..." : isFullSettlement ? "Pagar y Liquidar Deuda" : "Registrar Abono"}
        </button>
      </form>
    </div>
  );
}
