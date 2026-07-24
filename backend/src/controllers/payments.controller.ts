import { type Response, type NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { paymentsService } from "../services/payments.service";

export const paymentsController = {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentsService.register(req.userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getByDebt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentsService.getByDebt(req.userId!, req.params.debtId as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
