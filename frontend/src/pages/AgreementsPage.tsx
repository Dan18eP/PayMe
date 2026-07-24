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
    try {
      const r = await httpClient.post<Agreement>("/agreements/generate", {
        debtId: selectedDebtId,
        content: content || undefined,
      });
      setAgreement(r);
      setContent("");
    } catch (err: any) {
      setError(err.message || "Error al generar acuerdo");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: string) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(val));

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-headline-lg text-on-surface mb-lg">Acuerdos de Pago</h2>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card space-y-md">
        <div>
          <label className="text-label-md text-on-surface-variant">Deuda</label>
          <select
            value={selectedDebtId}
            onChange={(e) => { setSelectedDebtId(e.target.value); setAgreement(null); setContent(""); }}
            className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
          >
            <option value="">Seleccionar deuda</option>
            {debts.map((d) => (
              <option key={d.debts.id} value={d.debts.id}>
                {d.debtors.fullName} · {formatCurrency(d.debts.totalAmount)}
              </option>
            ))}
          </select>
        </div>

        {selectedDebt && (
          <>
            <div>
              <label className="text-label-md text-on-surface-variant">
                Contenido del acuerdo (opcional - se usa plantilla por defecto)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
                rows={6}
                placeholder={`ACUERDO DE COMPROMISO DE PAGO\n\nEntre ${selectedDebt.debtors.fullName} y el usuario de PayMe!...`}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-lg py-md bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined">description</span>
              {loading ? "Generando..." : "Generar Acuerdo"}
            </button>
          </>
        )}

        {error && (
          <div className="p-md bg-error-container text-on-error-container rounded-lg text-body-sm">{error}</div>
        )}

        {agreement && (
          <div className="p-md bg-tertiary-container/30 border border-tertiary/30 rounded-lg space-y-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-title-md text-on-surface">Acuerdo Generado</h3>
              <span className={`px-sm py-xs rounded text-label-md font-bold ${
                agreement.status === "signed" ? "bg-tertiary-container text-tertiary" :
                agreement.status === "expired" ? "bg-surface-container text-on-surface-variant" :
                "bg-secondary-container text-on-secondary-container"
              }`}>
                {agreement.status === "signed" ? "Firmado" :
                 agreement.status === "expired" ? "Expirado" : "Pendiente"}
              </span>
            </div>
            <div className="bg-surface p-md rounded-lg whitespace-pre-wrap text-body-sm max-h-60 overflow-y-auto">
              {agreement.content}
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Token de firma: {agreement.signatureToken?.substring(0, 20)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
