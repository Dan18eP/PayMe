import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { httpClient } from "../services/httpClient";
import type { DashboardSummary } from "../types";

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpClient
      .get<DashboardSummary>("/dashboard/summary")
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: string) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(val));

  return (
    <div>
      <div className="flex items-center justify-between mb-md">
        <h2 className="text-title-lg text-on-surface">Dashboard</h2>
        <Link
          to="/debts/create"
          className="flex items-center gap-xs px-md py-1.5 bg-primary text-on-primary rounded-lg text-body-sm hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nueva deuda
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-sm mb-md">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm border border-outline-variant p-sm rounded-xl animate-pulse">
              <div className="h-3 bg-surface-container-high rounded w-16 mb-xs" />
              <div className="h-5 bg-surface-container-high rounded w-20" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white/80 backdrop-blur-sm border border-outline-variant p-sm rounded-xl shadow-card">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-label-md text-on-surface-variant">Por cobrar</span>
                <span className="material-symbols-outlined text-primary text-[16px]">payments</span>
              </div>
              <p className="text-title-md font-bold text-primary">{summary ? formatCurrency(summary.totalDebt) : "$0"}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-outline-variant p-sm rounded-xl shadow-card">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-label-md text-on-surface-variant">Deudores</span>
                <span className="material-symbols-outlined text-primary text-[16px]">group</span>
              </div>
              <p className="text-title-md font-bold text-on-surface">{summary?.activeDebtors ?? 0}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-outline-variant p-sm rounded-xl shadow-card">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-label-md text-on-surface-variant">Pendientes</span>
                <span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span>
              </div>
              <p className="text-title-md font-bold text-on-surface">{summary?.pendingDebts ?? 0}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-outline-variant p-sm rounded-xl shadow-card">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-label-md text-on-surface-variant">Vencidas</span>
                <span className="material-symbols-outlined text-error text-[16px]">event_busy</span>
              </div>
              <p className="text-title-md font-bold text-error">{summary?.overdueDebts ?? 0}</p>
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-card">
            <div className="px-md py-sm border-b border-outline-variant flex items-center justify-between">
              <h3 className="text-title-md text-on-surface">Deudores críticos</h3>
              <Link to="/debtors" className="text-primary text-label-md hover:underline">Ver todos</Link>
            </div>
            <div className="p-md text-center text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] text-outline">group</span>
              <p className="mt-xs">Sin deudores en mora</p>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-card">
            <div className="px-md py-sm border-b border-outline-variant">
              <h3 className="text-title-md text-on-surface">Actividad</h3>
            </div>
            <div className="p-md text-center text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px] text-outline">timeline</span>
              <p className="mt-xs">Sin actividad reciente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
