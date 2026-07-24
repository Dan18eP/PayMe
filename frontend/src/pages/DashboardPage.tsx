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
      <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="text-headline-lg text-on-surface">Panel Principal</h2>
          <p className="text-body-md text-on-surface-variant">
            Resumen de tu cartera hoy, {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          to="/debts/create"
          className="flex items-center gap-xs px-lg py-md bg-primary text-on-primary rounded-xl text-title-md hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined">add</span>
          Nueva Deuda
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm border border-outline-variant p-md rounded-xl animate-pulse">
              <div className="h-4 bg-surface-container-high rounded w-24 mb-sm" />
              <div className="h-8 bg-surface-container-high rounded w-32" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white/80 backdrop-blur-sm border border-outline-variant p-md rounded-xl shadow-card">
              <div className="flex items-center justify-between mb-sm">
                <span className="text-on-surface-variant text-label-md uppercase tracking-wider">Total por cobrar</span>
                <span className="material-symbols-outlined text-primary">payments</span>
              </div>
              <p className="text-[28px] font-bold leading-[34px] tracking-[-0.01em] text-primary">
                {summary ? formatCurrency(summary.totalDebt) : "$0"}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-outline-variant p-md rounded-xl shadow-card">
              <div className="flex items-center justify-between mb-sm">
                <span className="text-on-surface-variant text-label-md uppercase tracking-wider">Deudores activos</span>
                <span className="material-symbols-outlined text-primary">group</span>
              </div>
              <p className="text-[28px] font-bold leading-[34px] text-on-surface">
                {summary?.activeDebtors ?? 0}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-outline-variant p-md rounded-xl shadow-card">
              <div className="flex items-center justify-between mb-sm">
                <span className="text-on-surface-variant text-label-md uppercase tracking-wider">Deudas pendientes</span>
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
              </div>
              <p className="text-[28px] font-bold leading-[34px] text-on-surface">
                {summary?.pendingDebts ?? 0}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-outline-variant p-md rounded-xl shadow-card">
              <div className="flex items-center justify-between mb-sm">
                <span className="text-on-surface-variant text-label-md uppercase tracking-wider">Próximos vencimientos</span>
                <span className="material-symbols-outlined text-error">event_busy</span>
              </div>
              <p className="text-[28px] font-bold leading-[34px] text-error">
                {summary?.overdueDebts ?? 0}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-lg">
          <section className="bg-white/80 backdrop-blur-sm border border-outline-variant rounded-xl overflow-hidden shadow-card">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="text-title-lg text-on-surface">Deudores Críticos</h3>
              <Link to="/debtors" className="text-primary text-label-md hover:underline">Ver todos</Link>
            </div>
            <div className="p-lg text-center text-on-surface-variant text-body-md py-xl">
              <span className="material-symbols-outlined text-[48px] text-outline">group</span>
              <p className="mt-sm">Los deudores con mora aparecerán aquí.</p>
              <Link to="/debtors" className="text-primary font-semibold hover:underline mt-sm inline-block">
                Ir a Deudores
              </Link>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-lg">
          <section className="bg-white/80 backdrop-blur-sm border border-outline-variant rounded-xl p-lg shadow-card">
            <h3 className="text-title-lg text-on-surface mb-lg">Actividad Reciente</h3>
            <div className="text-center text-on-surface-variant text-body-md py-xl">
              <span className="material-symbols-outlined text-[48px] text-outline">timeline</span>
              <p className="mt-sm">Tu actividad reciente se mostrará aquí.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
