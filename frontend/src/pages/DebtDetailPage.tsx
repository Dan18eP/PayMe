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
      httpClient.get<{ debts: Debt; debtors: { fullName: string } }[]>(`/debts`).then((r) =>
        r.find((d) => d.debts.id === id) || null
      ),
      httpClient.get<Payment[]>(`/payments/debt/${id}`),
    ])
      .then(([d, p]) => {
        setDebt(d);
        setPayments(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const formatCurrency = (val: string) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(val));

  if (loading) return <div className="text-center py-2xl text-on-surface-variant">Cargando...</div>;
  if (!debt) return <div className="text-center py-2xl text-on-surface-variant">Deuda no encontrada</div>;

  const d = debt.debts;
  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    partially_paid: "Parcialmente Pagada",
    paid: "Pagada",
    cancelled: "Cancelada",
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-primary text-body-md hover:underline flex items-center gap-xs mb-lg">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver
      </button>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-card mb-lg">
        <div className="flex justify-between items-start mb-md">
          <div>
            <h2 className="text-headline-md text-on-surface">Deuda · {debt.debtors.fullName}</h2>
            <p className="text-body-md text-on-surface-variant">Creada: {new Date(d.createdAt).toLocaleDateString("es-CO")}</p>
          </div>
          <span className={`px-sm py-xs rounded text-label-md font-bold ${
            d.status === "paid" ? "bg-tertiary-container text-tertiary" :
            d.status === "partially_paid" ? "bg-secondary-container text-on-secondary-container" :
            d.status === "cancelled" ? "bg-surface-container text-on-surface-variant" :
            "bg-error-container text-on-error-container"
          }`}>
            {statusLabel[d.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-md mb-md">
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider">Monto Total</p>
            <p className="text-kpi-value text-primary">{formatCurrency(d.totalAmount)}</p>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider">Saldo Pendiente</p>
            <p className="text-kpi-value text-on-surface">{formatCurrency(d.remainingBalance)}</p>
          </div>
        </div>

        {d.dueDate && (
          <p className="text-body-sm text-on-surface-variant">
            Fecha límite: {new Date(d.dueDate).toLocaleDateString("es-CO")}
          </p>
        )}

        {d.status !== "paid" && d.status !== "cancelled" && Number(d.remainingBalance) > 0 && (
          <Link
            to={`/payments/register?debtId=${d.id}`}
            className="mt-md inline-flex items-center gap-xs px-lg py-md bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90"
          >
            <span className="material-symbols-outlined">payments</span>
            Registrar Abono
          </Link>
        )}
      </div>

      <h3 className="text-title-lg text-on-surface mb-md">Historial de Pagos</h3>
      {payments.length === 0 ? (
        <div className="text-center py-xl text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
          <span className="material-symbols-outlined text-[48px] text-outline">payments</span>
          <p>No hay pagos registrados</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant text-label-md">
              <tr>
                <th className="px-lg py-md">Fecha</th>
                <th className="px-lg py-md">Monto</th>
                <th className="px-lg py-md">Tipo</th>
                <th className="px-lg py-md">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-surface-dim transition-colors">
                  <td className="px-lg py-md text-body-md">{new Date(p.paidAt).toLocaleDateString("es-CO")}</td>
                  <td className="px-lg py-md text-body-md font-semibold">{formatCurrency(p.amount)}</td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-xs rounded text-label-md font-bold ${
                      p.isFullSettlement ? "bg-tertiary-container text-tertiary" : "bg-secondary-container text-on-secondary-container"
                    }`}>
                      {p.isFullSettlement ? "Pago total" : "Abono"}
                    </span>
                  </td>
                  <td className="px-lg py-md text-body-sm text-on-surface-variant">{p.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
