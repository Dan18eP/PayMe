import { type Request, type Response, type NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { agreementsService } from "../services/agreements.service";

export const agreementsController = {
  async generate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await agreementsService.generate(req.userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async sign(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, signerName, signatureImage } = req.body;
      const result = await agreementsService.sign(token, signerName, signatureImage);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getByDebt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await agreementsService.getByDebt(req.userId!, req.params.debtId as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getPublicByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await agreementsService.getPublicByToken(req.params.token as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
