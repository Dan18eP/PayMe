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

  useEffect(() => {
    httpClient.get<Debtor[]>("/debtors").then(setDebtors).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body: any = {
        debtorId: formData.debtorId,
        totalAmount: formData.totalAmount,
      };
      if (formData.dueDate) body.dueDate = formData.dueDate;
      if (formData.frequency !== "one_time") {
        body.paymentSchedule = {
          frequency: formData.frequency,
        };
        if (formData.installmentAmount) body.paymentSchedule.installmentAmount = formData.installmentAmount;
        if (formData.installmentsCount) body.paymentSchedule.installmentsCount = Number(formData.installmentsCount);
        if (formData.customIntervalDays) body.paymentSchedule.customIntervalDays = Number(formData.customIntervalDays);
      }
      await httpClient.post("/debts", body);
      navigate("/debts");
    } catch (err: any) {
      setError(err.message || "Error al crear deuda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-headline-lg text-on-surface mb-lg">Nueva Deuda</h2>

      {error && (
        <div className="mb-md p-md bg-error-container text-on-error-container rounded-lg text-body-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card space-y-md">
        <div>
          <label className="text-label-md text-on-surface-variant">Deudor</label>
          <select
            value={formData.debtorId}
            onChange={(e) => setFormData({ ...formData, debtorId: e.target.value })}
            className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
            required
          >
            <option value="">Seleccionar deudor</option>
            {debtors.map((d) => (
              <option key={d.id} value={d.id}>{d.fullName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-label-md text-on-surface-variant">Monto total (COP)</label>
          <input
            type="number"
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
            placeholder="500000"
            required
            min={1}
          />
        </div>

        <div>
          <label className="text-label-md text-on-surface-variant">Fecha límite (opcional)</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-label-md text-on-surface-variant">Frecuencia de pago</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
          >
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
              <label className="text-label-md text-on-surface-variant">Monto por cuota</label>
              <input
                type="number"
                value={formData.installmentAmount}
                onChange={(e) => setFormData({ ...formData, installmentAmount: e.target.value })}
                className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
                placeholder="100000"
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant">Número de cuotas</label>
              <input
                type="number"
                value={formData.installmentsCount}
                onChange={(e) => setFormData({ ...formData, installmentsCount: e.target.value })}
                className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
                placeholder="12"
              />
            </div>
          </>
        )}

        {formData.frequency === "custom" && (
          <div>
            <label className="text-label-md text-on-surface-variant">Días entre cuotas</label>
            <input
              type="number"
              value={formData.customIntervalDays}
              onChange={(e) => setFormData({ ...formData, customIntervalDays: e.target.value })}
              className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
              placeholder="15"
            />
          </div>
        )}

        <div className="flex gap-sm pt-md">
          <button
            type="submit"
            disabled={loading}
            className="px-lg py-md bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Deuda"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-lg py-md border border-outline-variant rounded-lg text-title-md text-on-surface-variant hover:bg-surface-container-high"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
