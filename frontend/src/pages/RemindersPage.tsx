import { useEffect, useState } from "react";
import { httpClient } from "../services/httpClient";
import type { Debt, Debtor } from "../types";

export function RemindersPage() {
  const [debts, setDebts] = useState<{ debts: Debt; debtors: Debtor }[]>([]);
  const [selectedDebtId, setSelectedDebtId] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [result, setResult] = useState<{ waLink: string; message: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    httpClient.get<{ debts: Debt; debtors: Debtor }[]>("/debts")
      .then(setDebts)
      .catch(() => {});
  }, []);

  const selectedDebt = debts.find((d) => d.debts.id === selectedDebtId);

  const handleGenerate = async () => {
    if (!selectedDebtId) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await httpClient.post<{ waLink: string; message: string; phone: string; debtorName: string }>(
        "/reminders/generate-link",
        { debtId: selectedDebtId, message: customMessage || undefined }
      );
      setResult(r);
    } catch (err: any) {
      setError(err.message || "Error al generar recordatorio");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: string) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(val));

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-headline-lg text-on-surface mb-lg">Recordatorios WhatsApp</h2>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card space-y-md">
        <div>
          <label className="text-label-md text-on-surface-variant">Deuda</label>
          <select
            value={selectedDebtId}
            onChange={(e) => { setSelectedDebtId(e.target.value); setResult(null); setCustomMessage(""); }}
            className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
          >
            <option value="">Seleccionar deuda</option>
            {debts.map((d) => (
              <option key={d.debts.id} value={d.debts.id}>
                {d.debtors.fullName} · {formatCurrency(d.debts.remainingBalance)}
              </option>
            ))}
          </select>
        </div>

        {selectedDebt && (
          <>
            <div>
              <label className="text-label-md text-on-surface-variant">Mensaje personalizado (opcional)</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
                rows={3}
                placeholder={`Hola ${selectedDebt.debtors.fullName}, este es un recordatorio sobre tu deuda...`}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-lg py-md bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined">chat</span>
              {loading ? "Generando..." : "Generar Link de WhatsApp"}
            </button>
          </>
        )}

        {error && (
          <div className="p-md bg-error-container text-on-error-container rounded-lg text-body-sm">{error}</div>
        )}

        {result && (
          <div className="p-md bg-tertiary-container/30 border border-tertiary/30 rounded-lg space-y-sm">
            <p className="text-body-sm text-on-surface-variant">Mensaje:</p>
            <p className="text-body-md bg-surface p-md rounded-lg">{result.message}</p>
            <a
              href={result.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-xs w-full px-lg py-md bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90 mt-sm"
            >
              <span className="material-symbols-outlined">open_in_new</span>
              Abrir WhatsApp ({result.phone})
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
