import { type Response, type NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async summary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await dashboardService.getSummary(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async seniority(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await dashboardService.getDebtorsBySeniority(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
