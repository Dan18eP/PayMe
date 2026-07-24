import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { httpClient } from "../services/httpClient";
import type { Debt, Payment } from "../types";

export function DebtDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [debt, setDebt] = useState<{ debts: Debt; debtors: { fullName: string } } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      httpClient.get<{ debts: Debt; debtors: { fullName: string } }[]>("/debts").then((r) => r.find((d) => d.debts.id === id) || null),
      httpClient.get<Payment[]>(`/payments/debt/${id}`),
    ])
      .then(([d, p]) => { setDebt(d); setPayments(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (v: string) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(v));

  if (loading) return <div className="text-center py-xl text-body-sm text-on-surface-variant">Cargando...</div>;
  if (!debt) return <div className="text-center py-xl text-body-sm text-on-surface-variant">No encontrada</div>;

  const d = debt.debts;
  const statusLabel: Record<string, string> = { pending: "Pendiente", partially_paid: "Parcial", paid: "Pagada", cancelled: "Cancelada" };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-primary text-body-sm hover:underline flex items-center gap-xs mb-sm">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Volver
      </button>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-card mb-sm">
        <div className="flex items-center justify-between mb-sm">
          <div>
            <h2 className="text-title-md text-on-surface">{debt.debtors.fullName}</h2>
            <p className="text-label-md text-on-surface-variant">{new Date(d.createdAt).toLocaleDateString("es-CO")}</p>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            d.status === "paid" ? "bg-tertiary-container text-tertiary" :
            d.status === "partially_paid" ? "bg-secondary-container text-on-secondary-container" :
            d.status === "cancelled" ? "bg-surface-container text-on-surface-variant" :
            "bg-error-container text-on-error-container"
          }`}>{statusLabel[d.status]}</span>
        </div>

        <div className="grid grid-cols-2 gap-sm mb-sm">
          <div>
            <p className="text-label-md text-on-surface-variant">Total</p>
            <p className="text-title-md font-bold text-primary">{fmt(d.totalAmount)}</p>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant">Saldo</p>
            <p className="text-title-md font-bold text-on-surface">{fmt(d.remainingBalance)}</p>
          </div>
        </div>

        {d.dueDate && <p className="text-body-sm text-on-surface-variant">Vence: {new Date(d.dueDate).toLocaleDateString("es-CO")}</p>}

        {d.status !== "paid" && d.status !== "cancelled" && Number(d.remainingBalance) > 0 && (
          <Link to={`/payments/register?debtId=${d.id}`}
            className="mt-sm inline-flex items-center gap-xs px-md py-1.5 bg-primary text-on-primary rounded-lg text-body-sm">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            Abonar
          </Link>
        )}
      </div>

      <h3 className="text-title-md text-on-surface mb-sm">Pagos</h3>
      {payments.length === 0 ? (
        <div className="text-center py-lg text-body-sm text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
          Sin pagos registrados
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-card overflow-hidden">
          <div className="divide-y divide-outline-variant">
            {payments.map((p) => (
              <div key={p.id} className="px-md py-sm flex items-center justify-between">
                <div>
                  <p className="text-body-sm font-medium">{fmt(p.amount)}</p>
                  <p className="text-label-md text-on-surface-variant">{new Date(p.paidAt).toLocaleDateString("es-CO")}</p>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  p.isFullSettlement ? "bg-tertiary-container text-tertiary" : "bg-secondary-container text-on-secondary-container"
                }`}>
                  {p.isFullSettlement ? "Pago total" : "Abono"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
