import { type Response, type NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { remindersService } from "../services/reminders.service";

export const remindersController = {
  async generateLink(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { debtId, message } = req.body;
      const result = await remindersService.generateWhatsAppLink(
        req.userId!,
        debtId,
        message
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
