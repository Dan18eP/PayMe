import { useEffect, useState } from "react";
import { httpClient } from "../services/httpClient";

interface Settings {
  whatsappNumber: string | null;
  fullName: string | null;
  reminderTemplate: string | null;
  agreementTemplate: string | null;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    whatsappNumber: null, fullName: null, reminderTemplate: null, agreementTemplate: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    httpClient.get<Settings>("/settings")
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await httpClient.patch("/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-xl text-body-sm text-on-surface-variant">Cargando...</div>;

  return (
    <div className="max-w-[480px] mx-auto">
      <h2 className="text-title-lg text-on-surface mb-sm">Configuración</h2>

      {error && <div className="mb-sm p-sm bg-error-container text-on-error-container rounded text-body-sm">{error}</div>}
      {saved && <div className="mb-sm p-sm bg-tertiary-container text-tertiary rounded text-body-sm">Configuración guardada</div>}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card space-y-md">
        <div>
          <h3 className="text-title-md text-on-surface mb-sm">Datos de contacto</h3>
          <div className="space-y-sm">
            <div>
              <label className="text-label-md text-on-surface-variant mb-0.5 block">Tu nombre</label>
              <input
                value={settings.fullName || ""}
                onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
                placeholder="Como aparecerá en los acuerdos"
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant mb-0.5 block">WhatsApp</label>
              <input
                value={settings.whatsappNumber || ""}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
                placeholder="+573001234567"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-outline-variant pt-md">
          <h3 className="text-title-md text-on-surface mb-sm">Plantillas</h3>
          <div className="space-y-sm">
            <div>
              <label className="text-label-md text-on-surface-variant mb-0.5 block">Recordatorio WhatsApp</label>
              <textarea
                value={settings.reminderTemplate || ""}
                onChange={(e) => setSettings({ ...settings, reminderTemplate: e.target.value })}
                className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
                rows={3}
                placeholder="Hola {nombre}, recuerda tu deuda de {monto}..."
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant mb-0.5 block">Acuerdo de compromiso</label>
              <textarea
                value={settings.agreementTemplate || ""}
                onChange={(e) => setSettings({ ...settings, agreementTemplate: e.target.value })}
                className="w-full px-sm py-1.5 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
                rows={4}
                placeholder="ACUERDO DE COMPROMISO DE PAGO..."
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-1.5 bg-primary text-on-primary rounded-lg text-body-sm disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </div>
  );
}
