import { useEffect, useState } from "react";
import { httpClient } from "../services/httpClient";
import type { Debt, Debtor, Agreement } from "../types";

export function AgreementsPage() {
  const [debts, setDebts] = useState<{ debts: Debt; debtors: Debtor }[]>([]);
  const [selectedDebtId, setSelectedDebtId] = useState("");
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { httpClient.get<{ debts: Debt; debtors: Debtor }[]>("/debts").then(setDebts).catch(() => {}); }, []);

  const selectedDebt = debts.find((d) => d.debts.id === selectedDebtId);

  const handleGenerate = async () => {
    if (!selectedDebtId) return;
    setLoading(true);
    setError("");
    try {
      const r = await httpClient.post<Agreement>("/agreements/generate", { debtId: selectedDebtId, content: content || undefined });
      setAgreement(r);
      setContent("");
    } catch (err: any) { setError(err.message || "Error"); } finally { setLoading(false); }
  };

  const fmt = (v: string) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(v));

  return (
    <div className="max-w-[480px] mx-auto">
      <h2 className="text-title-lg text-on-surface mb-sm">Acuerdos de pago</h2>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card space-y-sm">
        <div>
          <label className="text-label-md text-on-surface-variant mb-0.5 block">Deuda</label>
          <select value={selectedDebtId} onChange={(e) => { setSelectedDebtId(e.target.value); setAgreement(null); setContent(""); }}
            className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary">
            <option value="">Seleccionar</option>
            {debts.map((d) => (
              <option key={d.debts.id} value={d.debts.id}>{d.debtors.fullName} · {fmt(d.debts.totalAmount)}</option>
            ))}
          </select>
        </div>

        {selectedDebt && (
          <>
            <div>
              <label className="text-label-md text-on-surface-variant mb-0.5 block">Contenido (opcional - se usa plantilla)</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
                rows={4} placeholder="Personaliza el acuerdo..." />
            </div>
            <button onClick={handleGenerate} disabled={loading}
              className="w-full py-1.5 bg-primary text-on-primary rounded-lg text-body-sm disabled:opacity-50 flex items-center justify-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">description</span>
              {loading ? "Generando..." : "Generar acuerdo"}
            </button>
          </>
        )}

        {error && <div className="p-sm bg-error-container text-on-error-container rounded text-body-sm">{error}</div>}

        {agreement && (
          <div className="p-sm bg-tertiary-container/30 border border-tertiary/30 rounded-lg space-y-sm">
            <div className="flex items-center justify-between">
              <span className="text-title-md text-on-surface">Acuerdo generado</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                agreement.status === "signed" ? "bg-tertiary-container text-tertiary" : "bg-secondary-container text-on-secondary-container"
              }`}>
                {agreement.status === "signed" ? "Firmado" : "Pendiente"}
              </span>
            </div>
            <div className="bg-surface p-sm rounded-lg whitespace-pre-wrap text-body-sm max-h-40 overflow-y-auto">
              {agreement.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
