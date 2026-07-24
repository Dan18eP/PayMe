import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { httpClient } from "../services/httpClient";

export function SignAgreementPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [agreement, setAgreement] = useState<{ content: string; status: string; signedAt: string | null } | null>(null);
  const [signerName, setSignerName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    httpClient
      .get<{ content: string; status: string; signedAt: string | null }>(`/agreements/public/${token}`)
      .then(setAgreement)
      .catch((err) => setError(err.message || "Acuerdo no encontrado"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !signerName.trim()) return;
    setSigning(true);
    setError("");
    try {
      await httpClient.post("/agreements/sign", { token, signerName: signerName.trim() });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al firmar");
    } finally {
      setSigning(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-sm">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card text-center max-w-[400px]">
          <span className="material-symbols-outlined text-[48px] text-error">link_off</span>
          <p className="text-body-md text-on-surface mt-sm">Enlace inválido</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-sm">
        <div className="text-body-md text-on-surface-variant animate-pulse">Cargando acuerdo...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-sm">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card text-center max-w-[400px]">
          <span className="material-symbols-outlined text-[48px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <h2 className="text-title-lg text-on-surface mt-sm">¡Acuerdo firmado!</h2>
          <p className="text-body-sm text-on-surface-variant mt-xs">Gracias, {signerName}. Tu compromiso ha sido registrado.</p>
        </div>
      </div>
    );
  }

  if (error && !agreement) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-sm">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card text-center max-w-[400px]">
          <span className="material-symbols-outlined text-[48px] text-error">error</span>
          <p className="text-body-md text-on-surface mt-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-sm">
      <div className="w-full max-w-[560px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-card overflow-hidden">
        <div className="bg-primary px-lg py-md">
          <h1 className="text-title-md font-bold text-on-primary">Acuerdo de Compromiso de Pago</h1>
        </div>

        <div className="p-md">
          {error && (
            <div className="mb-sm p-sm bg-error-container text-on-error-container rounded text-body-sm">{error}</div>
          )}

          {agreement?.status === "signed" ? (
            <div className="text-center py-lg">
              <span className="material-symbols-outlined text-[40px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="text-body-md text-on-surface mt-sm">Este acuerdo ya fue firmado</p>
              {agreement.signedAt && (
                <p className="text-body-sm text-on-surface-variant mt-xs">{new Date(agreement.signedAt).toLocaleString("es-CO")}</p>
              )}
            </div>
          ) : (
            <>
              <div className="bg-surface p-md rounded-lg mb-md max-h-60 overflow-y-auto whitespace-pre-wrap text-body-sm">
                {agreement?.content}
              </div>

              <form onSubmit={handleSign} className="space-y-sm">
                <div>
                  <label className="text-label-md text-on-surface-variant mb-0.5 block">Tu nombre completo</label>
                  <input
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full px-sm py-2 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
                    placeholder="Escribe tu nombre para aceptar"
                    required
                    minLength={2}
                  />
                </div>
                <p className="text-label-md text-on-surface-variant">
                  Al hacer clic en "Aceptar", confirmas tu compromiso de pago voluntario.
                </p>
                <button
                  type="submit"
                  disabled={signing || !signerName.trim()}
                  className="w-full py-2 bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90 disabled:opacity-50"
                >
                  {signing ? "Firmando..." : "Aceptar y Firmar"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
