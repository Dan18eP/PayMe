import { Router } from "express";
import authRoutes from "./auth.routes";
import debtorsRoutes from "./debtors.routes";
import debtsRoutes from "./debts.routes";
import paymentsRoutes from "./payments.routes";
import remindersRoutes from "./reminders.routes";
import agreementsRoutes from "./agreements.routes";
import dashboardRoutes from "./dashboard.routes";
import historyRoutes from "./history.routes";
import settingsRoutes from "./settings.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/debtors", debtorsRoutes);
router.use("/debts", debtsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/reminders", remindersRoutes);
router.use("/agreements", agreementsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/history", historyRoutes);
router.use("/settings", settingsRoutes);

export default router;
