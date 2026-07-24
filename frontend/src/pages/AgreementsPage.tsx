import { useEffect, useState } from "react";
import { httpClient } from "../services/httpClient";
import type { Debt, Debtor, Agreement } from "../types";

export function AgreementsPage() {
  const [debts, setDebts] = useState<{ debts: Debt; debtors: Debtor }[]>([]);
  const [selectedDebtId, setSelectedDebtId] = useState("");
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loadingAgreement, setLoadingAgreement] = useState(false);
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    httpClient.get<{ debts: Debt; debtors: Debtor }[]>("/debts")
      .then(setDebts)
      .catch(() => {});
  }, []);

  const selectedDebt = debts.find((d) => d.debts.id === selectedDebtId);

  // Check if agreement exists when debt is selected
  useEffect(() => {
    if (!selectedDebtId) { setAgreement(null); return; }
    setLoadingAgreement(true);
    setError("");
    httpClient
      .get<Agreement>(`/agreements/debt/${selectedDebtId}`)
      .then((a) => setAgreement(a))
      .catch(() => setAgreement(null))
      .finally(() => setLoadingAgreement(false));
  }, [selectedDebtId]);

  const handleGenerate = async () => {
    if (!selectedDebtId) return;
    setGenerating(true);
    setError("");
    try {
      const r = await httpClient.post<Agreement>("/agreements/generate", {
        debtId: selectedDebtId,
        content: content || undefined,
      });
      setAgreement(r);
      setContent("");
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setGenerating(false);
    }
  };

  const fmt = (v: string) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(v));

  const signUrl = agreement?.signatureToken
    ? `${window.location.origin}/sign-agreement?token=${agreement.signatureToken}`
    : "";

  const waMessage = agreement
    ? `Hola ${selectedDebt?.debtors.fullName || ""}, he generado un acuerdo de compromiso de pago. Por favor, revísalo y fírmalo aquí: ${signUrl}`
    : "";

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-title-lg text-on-surface mb-sm">Acuerdos de pago</h2>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card space-y-sm">
        <div>
          <label className="text-label-md text-on-surface-variant mb-0.5 block">Deuda</label>
          <select
            value={selectedDebtId}
            onChange={(e) => { setSelectedDebtId(e.target.value); setContent(""); }}
            className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
          >
            <option value="">Seleccionar</option>
            {debts.map((d) => (
              <option key={d.debts.id} value={d.debts.id}>
                {d.debtors.fullName} · {fmt(d.debts.totalAmount)}
              </option>
            ))}
          </select>
        </div>

        {loadingAgreement && (
          <div className="text-center text-body-sm text-on-surface-variant py-md">Cargando...</div>
        )}

        {error && <div className="p-sm bg-error-container text-on-error-container rounded text-body-sm">{error}</div>}

        {/* Existing agreement */}
        {agreement && !loadingAgreement && (
          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-title-md text-on-surface">Acuerdo</h3>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                agreement.status === "signed" ? "bg-tertiary-container text-tertiary" :
                agreement.status === "expired" ? "bg-surface-container text-on-surface-variant" :
                "bg-secondary-container text-on-secondary-container"
              }`}>
                {agreement.status === "signed" ? "Firmado" :
                 agreement.status === "expired" ? "Expirado" : "Pendiente"}
              </span>
            </div>

            <div className="bg-surface p-sm rounded-lg whitespace-pre-wrap text-body-sm max-h-40 overflow-y-auto">
              {agreement.content}
            </div>

            {agreement.status === "signed" && agreement.signedAt && (
              <p className="text-body-sm text-tertiary">
                Firmado: {new Date(agreement.signedAt).toLocaleString("es-CO")}
              </p>
            )}

            {agreement.status === "pending" && signUrl && (
              <a
                href={`https://wa.me/${selectedDebt?.debtors.phone ? selectedDebt.debtors.phone.replace(/[^\d]/g, "") : ""}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-xs w-full py-1.5 bg-primary text-on-primary rounded-lg text-body-sm"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                Enviar por WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Generate form (only if no agreement) */}
        {!agreement && !loadingAgreement && selectedDebt && (
          <>
            <div>
              <label className="text-label-md text-on-surface-variant mb-0.5 block">
                Contenido (opcional - se usa plantilla por defecto)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
                rows={4}
                placeholder="Personaliza el acuerdo..."
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-1.5 bg-primary text-on-primary rounded-lg text-body-sm disabled:opacity-50 flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              {generating ? "Generando..." : "Generar acuerdo"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
