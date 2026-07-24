import { type Response, type NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { settingsService } from "../services/settings.service";

export const settingsController = {
  async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.get(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.update(req.userId!, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
