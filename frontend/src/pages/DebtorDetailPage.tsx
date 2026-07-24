import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { httpClient } from "../services/httpClient";
import type { Debtor, Debt } from "../types";

export function DebtorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [debtor, setDebtor] = useState<Debtor | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      httpClient.get<Debtor>(`/debtors/${id}`),
      httpClient.get<{ debts: Debt; debtors: Debtor }[]>("/debts").then((r) =>
        r.filter((d) => d.debts.debtorId === id).map((d) => d.debts)
      ),
    ])
      .then(([d, ds]) => { setDebtor(d); setDebts(ds); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (v: string) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(v));

  if (loading) return <div className="text-center py-xl text-body-sm text-on-surface-variant">Cargando...</div>;
  if (!debtor) return <div className="text-center py-xl text-body-sm text-on-surface-variant">No encontrado</div>;

  return (
    <div>
      <Link to="/debtors" className="text-primary text-body-sm hover:underline flex items-center gap-xs mb-sm">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Volver
      </Link>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card mb-sm">
        <div className="flex items-center gap-sm mb-sm">
          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center font-bold text-secondary text-title-md shrink-0">
            {debtor.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-title-md text-on-surface">{debtor.fullName}</h2>
            <p className="text-body-sm text-on-surface-variant">{debtor.phone}</p>
          </div>
        </div>
        {debtor.notes && <p className="text-body-sm text-on-surface-variant mb-sm">{debtor.notes}</p>}
        <Link to={`/debts/create?debtorId=${debtor.id}`}
          className="inline-flex items-center gap-xs px-md py-1.5 bg-primary text-on-primary rounded-lg text-body-sm">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nueva deuda
        </Link>
      </div>

      <h3 className="text-title-md text-on-surface mb-sm">Deudas</h3>
      {debts.length === 0 ? (
        <div className="text-center py-lg text-body-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
          Sin deudas registradas
        </div>
      ) : (
        <div className="space-y-sm">
          {debts.map((debt) => (
            <Link key={debt.id} to={`/debts/${debt.id}`}
              className="block bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm font-medium text-on-surface">{fmt(debt.totalAmount)}</p>
                  <p className="text-label-md text-on-surface-variant">Saldo: {fmt(debt.remainingBalance)}</p>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  debt.status === "paid" ? "bg-tertiary-container text-tertiary" :
                  debt.status === "partially_paid" ? "bg-secondary-container text-on-secondary-container" :
                  debt.status === "cancelled" ? "bg-surface-container text-on-surface-variant" :
                  "bg-error-container text-on-error-container"
                }`}>
                  {debt.status === "paid" ? "Pagada" : debt.status === "partially_paid" ? "Parcial" : debt.status === "cancelled" ? "Cancelada" : "Pendiente"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
