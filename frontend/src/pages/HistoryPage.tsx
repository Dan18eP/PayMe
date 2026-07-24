import { useEffect, useState } from "react";
import { httpClient } from "../services/httpClient";
import type { HistoryEvent } from "../types";

const eventConfig: Record<string, { icon: string; bg: string; color: string; label: string }> = {
  debt_created: { icon: "add_circle", bg: "bg-tertiary-container", color: "text-tertiary", label: "Deuda creada" },
  payment_registered: { icon: "payments", bg: "bg-secondary-container", color: "text-secondary", label: "Pago registrado" },
  debt_closed: { icon: "check_circle", bg: "bg-tertiary-container", color: "text-tertiary", label: "Deuda cerrada" },
  reminder_sent: { icon: "notifications_active", bg: "bg-primary-fixed", color: "text-on-primary-fixed", label: "Recordatorio enviado" },
  agreement_generated: { icon: "description", bg: "bg-secondary-container", color: "text-secondary", label: "Acuerdo generado" },
  agreement_signed: { icon: "edit_note", bg: "bg-tertiary-container", color: "text-tertiary", label: "Acuerdo firmado" },
};

export function HistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    httpClient
      .get<HistoryEvent[]>(`/history${filter ? `?eventType=${filter}` : ""}`)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <h2 className="text-title-lg text-on-surface mb-sm">Historial</h2>

      {/* Filters */}
      <div className="flex gap-sm overflow-x-auto pb-sm mb-sm">
        <button
          onClick={() => setFilter("")}
          className={`whitespace-nowrap px-md py-1 rounded-full text-body-sm transition-colors ${
            !filter ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          Todos
        </button>
        {Object.entries(eventConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`whitespace-nowrap px-md py-1 rounded-full text-body-sm transition-colors ${
              filter === key ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md animate-pulse flex gap-sm">
              <div className="w-8 h-8 bg-surface-container-high rounded-full shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-surface-container-high rounded w-48 mb-xs" />
                <div className="h-3 bg-surface-container-high rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-xl text-body-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
          <span className="material-symbols-outlined text-[40px] text-outline">history</span>
          <p className="mt-xs">No hay eventos registrados</p>
        </div>
      ) : (
        <div className="space-y-sm">
          {events.map((ev) => {
            const cfg = eventConfig[ev.eventType] || { icon: "info", bg: "bg-surface-container", color: "text-on-surface-variant", label: ev.eventType };
            return (
              <div
                key={ev.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card flex items-start gap-sm"
              >
                <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-[16px] ${cfg.color}`}>{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-on-surface">{ev.description}</p>
                  <p className="text-label-md text-on-surface-variant">
                    {cfg.label} · {new Date(ev.createdAt).toLocaleString("es-CO")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
