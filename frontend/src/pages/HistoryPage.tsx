import { useEffect, useState } from "react";
import { httpClient } from "../services/httpClient";
import type { HistoryEvent } from "../types";

export function HistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    httpClient
      .get<HistoryEvent[]>("/dashboard/summary")
      .then(() =>
        httpClient.get<{ debts: any; debtors: any }[]>("/debts").then(() => {
          setEvents([]);
        })
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-headline-lg text-on-surface mb-lg">Historial</h2>

      {loading ? (
        <div className="space-y-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg animate-pulse flex gap-md">
              <div className="w-8 h-8 bg-surface-container-high rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-surface-container-high rounded w-48 mb-sm" />
                <div className="h-3 bg-surface-container-high rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-2xl text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
          <span className="material-symbols-outlined text-[64px] text-outline">history</span>
          <p className="text-body-lg mt-md">El historial de eventos se mostrará aquí</p>
          <p className="text-body-sm text-on-surface-variant mt-sm">(Endpoint pendiente de implementar en backend)</p>
        </div>
      )}
    </div>
  );
}
