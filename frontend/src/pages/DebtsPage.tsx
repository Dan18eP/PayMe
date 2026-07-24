import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { httpClient } from "../services/httpClient";
import type { Debt, Debtor } from "../types";

export function DebtsPage() {
  const [debts, setDebts] = useState<{ debts: Debt; debtors: Debtor }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpClient
      .get<{ debts: Debt; debtors: Debtor }[]>("/debts")
      .then(setDebts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: string) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(val));

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    partially_paid: "Parcial",
    paid: "Pagada",
    cancelled: "Cancelada",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-headline-lg text-on-surface">Deudas</h2>
        <Link
          to="/debts/create"
          className="flex items-center gap-xs px-lg py-md bg-primary text-on-primary rounded-xl text-title-md hover:opacity-90"
        >
          <span className="material-symbols-outlined">add</span>
          Nueva Deuda
        </Link>
      </div>

      {loading ? (
        <div className="space-y-md">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg animate-pulse">
              <div className="h-5 bg-surface-container-high rounded w-48 mb-sm" />
              <div className="h-4 bg-surface-container-high rounded w-32" />
            </div>
          ))}
        </div>
      ) : debts.length === 0 ? (
        <div className="text-center py-2xl text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
          <span className="material-symbols-outlined text-[64px] text-outline">account_balance_wallet</span>
          <p className="text-body-lg mt-md">No hay deudas registradas</p>
          <Link
            to="/debts/create"
            className="mt-md inline-flex items-center gap-xs px-lg py-md bg-primary text-on-primary rounded-xl"
          >
            <span className="material-symbols-outlined">add</span>
            Crear primera deuda
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant text-label-md">
              <tr>
                <th className="px-lg py-md">Deudor</th>
                <th className="px-lg py-md">Monto Total</th>
                <th className="px-lg py-md">Saldo</th>
                <th className="px-lg py-md">Estado</th>
                <th className="px-lg py-md">Vence</th>
                <th className="px-lg py-md text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {debts.map((d) => (
                <tr key={d.debts.id} className="hover:bg-surface-dim transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-sm font-bold text-secondary">
                        {d.debtors.fullName.charAt(0)}
                      </div>
                      <span className="text-body-md font-medium">{d.debtors.fullName}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md text-body-md">{formatCurrency(d.debts.totalAmount)}</td>
                  <td className="px-lg py-md text-body-md font-semibold">{formatCurrency(d.debts.remainingBalance)}</td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-xs rounded text-label-md font-bold ${
                      d.debts.status === "paid" ? "bg-tertiary-container text-tertiary" :
                      d.debts.status === "partially_paid" ? "bg-secondary-container text-on-secondary-container" :
                      d.debts.status === "cancelled" ? "bg-surface-container text-on-surface-variant" :
                      "bg-error-container text-on-error-container"
                    }`}>
                      {statusLabel[d.debts.status]}
                    </span>
                  </td>
                  <td className="px-lg py-md text-body-sm text-on-surface-variant">
                    {d.debts.dueDate ? new Date(d.debts.dueDate).toLocaleDateString("es-CO") : "-"}
                  </td>
                  <td className="px-lg py-md text-right">
                    <Link
                      to={`/debts/${d.debts.id}`}
                      className="text-primary text-label-md font-semibold hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
