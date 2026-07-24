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
      httpClient.get<{ debts: Debt; debtors: Debtor }[]>(`/debts`).then((r) =>
        r.filter((d) => d.debts.debtorId === id).map((d) => d.debts)
      ),
    ])
      .then(([d, ds]) => {
        setDebtor(d);
        setDebts(ds);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const formatCurrency = (val: string) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(val));

  if (loading) return <div className="text-center py-2xl text-on-surface-variant">Cargando...</div>;
  if (!debtor) return <div className="text-center py-2xl text-on-surface-variant">Deudor no encontrado</div>;

  return (
    <div>
      <Link to="/debtors" className="text-primary text-body-md hover:underline flex items-center gap-xs mb-lg">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver a Deudores
      </Link>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card mb-lg">
        <div className="flex items-center gap-md mb-md">
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center font-bold text-secondary text-title-lg">
            {debtor.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-headline-md text-on-surface">{debtor.fullName}</h2>
            <p className="text-body-md text-on-surface-variant">{debtor.phone}</p>
          </div>
        </div>
        {debtor.notes && <p className="text-body-md text-on-surface-variant">{debtor.notes}</p>}
        <div className="flex gap-sm mt-md">
          <Link
            to={`/debts/create?debtorId=${debtor.id}`}
            className="px-lg py-sm bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90"
          >
            + Nueva Deuda
          </Link>
        </div>
      </div>

      <h3 className="text-title-lg text-on-surface mb-md">Deudas</h3>
      {debts.length === 0 ? (
        <div className="text-center py-xl text-on-surface-variant">
          <p>No hay deudas registradas para este deudor</p>
        </div>
      ) : (
        <div className="space-y-md">
          {debts.map((debt) => (
            <Link
              key={debt.id}
              to={`/debts/${debt.id}`}
              className="block bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card hover:border-primary/30 transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-title-md text-on-surface">{formatCurrency(debt.totalAmount)}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    Saldo: {formatCurrency(debt.remainingBalance)} · Creada: {new Date(debt.createdAt).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <span className={`px-sm py-xs rounded text-label-md font-bold ${
                  debt.status === "paid" ? "bg-tertiary-container text-tertiary" :
                  debt.status === "partially_paid" ? "bg-secondary-container text-on-secondary-container" :
                  debt.status === "cancelled" ? "bg-surface-container text-on-surface-variant" :
                  "bg-error-container text-on-error-container"
                }`}>
                  {debt.status === "paid" ? "Pagada" :
                   debt.status === "partially_paid" ? "Parcial" :
                   debt.status === "cancelled" ? "Cancelada" : "Pendiente"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
