import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { httpClient } from "../services/httpClient";
import type { Debt, Debtor } from "../types";

export function DebtsPage() {
  const [debts, setDebts] = useState<{ debts: Debt; debtors: Debtor }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpClient.get<{ debts: Debt; debtors: Debtor }[]>("/debts")
      .then(setDebts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v: string) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(v));
  const statusLabel: Record<string, string> = { pending: "Pendiente", partially_paid: "Parcial", paid: "Pagada", cancelled: "Cancelada" };

  return (
    <div>
      <div className="flex items-center justify-between mb-sm">
        <h2 className="text-title-lg text-on-surface">Deudas</h2>
        <Link to="/debts/create"
          className="flex items-center gap-xs px-md py-1.5 bg-primary text-on-primary rounded-lg text-body-sm hover:opacity-90">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nueva
        </Link>
      </div>

      {loading ? (
        <div className="space-y-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md animate-pulse">
              <div className="h-4 bg-surface-container-high rounded w-40 mb-xs" />
              <div className="h-3 bg-surface-container-high rounded w-24" />
            </div>
          ))}
        </div>
      ) : debts.length === 0 ? (
        <div className="text-center py-xl text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
          <span className="material-symbols-outlined text-[40px] text-outline">account_balance_wallet</span>
          <p className="text-body-sm mt-xs">No hay deudas</p>
          <Link to="/debts/create" className="mt-sm inline-flex items-center gap-xs px-md py-1.5 bg-primary text-on-primary rounded-lg text-body-sm">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Crear deuda
          </Link>
        </div>
      ) : (
        <div className="space-y-sm">
          {debts.map((d) => (
            <Link key={d.debts.id} to={`/debts/${d.debts.id}`}
              className="block bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm min-w-0">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-sm font-bold text-secondary shrink-0">
                    {d.debtors.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium text-on-surface truncate">{d.debtors.fullName}</p>
                    <p className="text-label-md text-on-surface-variant">{fmt(d.debts.remainingBalance)}</p>
                  </div>
                </div>
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  d.debts.status === "paid" ? "bg-tertiary-container text-tertiary" :
                  d.debts.status === "partially_paid" ? "bg-secondary-container text-on-secondary-container" :
                  d.debts.status === "cancelled" ? "bg-surface-container text-on-surface-variant" :
                  "bg-error-container text-on-error-container"
                }`}>
                  {statusLabel[d.debts.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
