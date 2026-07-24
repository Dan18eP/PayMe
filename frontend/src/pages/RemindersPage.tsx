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

  useEffect(() => { httpClient.get<{ debts: Debt; debtors: Debtor }[]>("/debts").then(setDebts).catch(() => {}); }, []);

  const selectedDebt = debts.find((d) => d.debts.id === selectedDebtId);

  const handleGenerate = async () => {
    if (!selectedDebtId) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await httpClient.post<{ waLink: string; message: string; phone: string; debtorName: string }>(
        "/reminders/generate-link", { debtId: selectedDebtId, message: customMessage || undefined }
      );
      setResult(r);
    } catch (err: any) { setError(err.message || "Error"); } finally { setLoading(false); }
  };

  const fmt = (v: string) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(v));

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-title-lg text-on-surface mb-sm">Recordatorios WhatsApp</h2>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card space-y-sm">
        <div>
          <label className="text-label-md text-on-surface-variant mb-0.5 block">Deuda</label>
          <select value={selectedDebtId} onChange={(e) => { setSelectedDebtId(e.target.value); setResult(null); setCustomMessage(""); }}
            className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary">
            <option value="">Seleccionar</option>
            {debts.map((d) => (
              <option key={d.debts.id} value={d.debts.id}>{d.debtors.fullName} · {fmt(d.debts.remainingBalance)}</option>
            ))}
          </select>
        </div>

        {selectedDebt && (
          <>
            <div>
              <label className="text-label-md text-on-surface-variant mb-0.5 block">Mensaje (opcional)</label>
              <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
                rows={3} placeholder={`Hola ${selectedDebt.debtors.fullName}, recuerda tu deuda...`} />
            </div>
            <button onClick={handleGenerate} disabled={loading}
              className="w-full py-1.5 bg-primary text-on-primary rounded-lg text-body-sm disabled:opacity-50 flex items-center justify-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">chat</span>
              {loading ? "Generando..." : "Generar link"}
            </button>
          </>
        )}

        {error && <div className="p-sm bg-error-container text-on-error-container rounded text-body-sm">{error}</div>}

        {result && (
          <div className="p-sm bg-tertiary-container/30 border border-tertiary/30 rounded-lg space-y-sm">
            <p className="text-label-md text-on-surface-variant">Mensaje:</p>
            <p className="text-body-sm bg-surface p-sm rounded-lg">{result.message}</p>
            <a href={result.waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-xs w-full py-1.5 bg-primary text-on-primary rounded-lg text-body-sm">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Abrir WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
