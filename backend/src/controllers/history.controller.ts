import { type Request, type Response, type NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { historyService } from "../services/history.service";

export const historyController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventType, startDate, endDate } = req.query;
      const result = await historyService.list(req.userId!, {
        eventType: eventType as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
