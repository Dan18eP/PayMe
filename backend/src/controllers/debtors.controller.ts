import { type Response, type NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { debtorsService } from "../services/debtors.service";

export const debtorsController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string | undefined;
      const result = q
        ? await debtorsService.search(req.userId!, q)
        : await debtorsService.list(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await debtorsService.getById(req.userId!, req.params.id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await debtorsService.create(req.userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await debtorsService.update(req.userId!, req.params.id as string, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await debtorsService.delete(req.userId!, req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
