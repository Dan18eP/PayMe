import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { httpClient } from "../services/httpClient";
import type { Debtor } from "../types";

export function CreateDebtPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDebtorId = searchParams.get("debtorId");

  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [formData, setFormData] = useState({
    debtorId: preselectedDebtorId || "",
    totalAmount: "",
    dueDate: "",
    frequency: "one_time",
    installmentAmount: "",
    installmentsCount: "",
    customIntervalDays: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { httpClient.get<Debtor[]>("/debtors").then(setDebtors).catch(() => {}); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: any = { debtorId: formData.debtorId, totalAmount: formData.totalAmount };
      if (formData.dueDate) body.dueDate = formData.dueDate;
      if (formData.frequency !== "one_time") {
        body.paymentSchedule = { frequency: formData.frequency };
        if (formData.installmentAmount) body.paymentSchedule.installmentAmount = formData.installmentAmount;
        if (formData.installmentsCount) body.paymentSchedule.installmentsCount = Number(formData.installmentsCount);
        if (formData.customIntervalDays) body.paymentSchedule.customIntervalDays = Number(formData.customIntervalDays);
      }
      await httpClient.post("/debts", body);
      navigate("/debts");
    } catch (err: any) { setError(err.message || "Error"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[480px] mx-auto">
      <h2 className="text-title-lg text-on-surface mb-sm">Nueva deuda</h2>

      {error && <div className="mb-sm p-sm bg-error-container text-on-error-container rounded text-body-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card space-y-sm">
        <div>
          <label className="text-label-md text-on-surface-variant mb-0.5 block">Deudor</label>
          <select value={formData.debtorId} onChange={(e) => setFormData({ ...formData, debtorId: e.target.value })}
            className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary" required>
            <option value="">Seleccionar</option>
            {debtors.map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
          </select>
        </div>

        <div>
          <label className="text-label-md text-on-surface-variant mb-0.5 block">Monto total (COP)</label>
          <input type="number" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
            placeholder="500000" required min={1} />
        </div>

        <div>
          <label className="text-label-md text-on-surface-variant mb-0.5 block">Fecha límite (opcional)</label>
          <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="text-label-md text-on-surface-variant mb-0.5 block">Frecuencia</label>
          <select value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary">
            <option value="one_time">Pago único</option>
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="biweekly">Quincenal</option>
            <option value="monthly">Mensual</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {formData.frequency !== "one_time" && (
          <>
            <div>
              <label className="text-label-md text-on-surface-variant mb-0.5 block">Monto por cuota</label>
              <input type="number" value={formData.installmentAmount} onChange={(e) => setFormData({ ...formData, installmentAmount: e.target.value })}
                className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary" placeholder="100000" />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant mb-0.5 block">N° de cuotas</label>
              <input type="number" value={formData.installmentsCount} onChange={(e) => setFormData({ ...formData, installmentsCount: e.target.value })}
                className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary" placeholder="12" />
            </div>
          </>
        )}

        {formData.frequency === "custom" && (
          <div>
            <label className="text-label-md text-on-surface-variant mb-0.5 block">Días entre cuotas</label>
            <input type="number" value={formData.customIntervalDays} onChange={(e) => setFormData({ ...formData, customIntervalDays: e.target.value })}
              className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary" placeholder="15" />
          </div>
        )}

        <div className="flex gap-sm pt-sm">
          <button type="submit" disabled={loading}
            className="px-md py-1.5 bg-primary text-on-primary rounded-lg text-body-sm disabled:opacity-50">
            {loading ? "Creando..." : "Crear"}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-md py-1.5 border border-outline-variant rounded-lg text-body-sm">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
