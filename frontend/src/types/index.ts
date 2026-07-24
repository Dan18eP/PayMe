export interface Debtor {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  debtorId: string;
  totalAmount: string;
  remainingBalance: string;
  currency: string;
  status: "pending" | "partially_paid" | "paid" | "cancelled";
  dueDate: string | null;
  createdAt: string;
  closedAt: string | null;
}

export interface PaymentSchedule {
  id: string;
  debtId: string;
  frequency: "one_time" | "daily" | "weekly" | "biweekly" | "monthly" | "custom";
  installmentAmount: string | null;
  installmentsCount: number | null;
  customIntervalDays: number | null;
}

export interface Payment {
  id: string;
  debtId: string;
  amount: string;
  paidAt: string;
  isFullSettlement: boolean;
  notes: string | null;
}

export interface HistoryEvent {
  id: string;
  userId: string;
  debtorId: string | null;
  debtId: string | null;
  paymentId: string | null;
  eventType:
    | "debt_created"
    | "payment_registered"
    | "debt_closed"
    | "reminder_sent"
    | "agreement_generated"
    | "agreement_signed";
  description: string;
  createdAt: string;
}

export interface Agreement {
  id: string;
  debtId: string;
  content: string;
  signatureToken: string | null;
  tokenExpiresAt: string | null;
  status: "pending" | "signed" | "expired";
  signatureImageUrl: string | null;
  signedAt: string | null;
  signerIp: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  totalDebt: string;
  activeDebtors: number;
  pendingDebts: number;
  totalPaid: string;
  overdueDebts: number;
}
