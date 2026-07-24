import { type Response, type NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { debtsService } from "../services/debts.service";

export const debtsController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await debtsService.list(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await debtsService.getById(req.userId!, req.params.id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await debtsService.create(req.userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await debtsService.update(req.userId!, req.params.id as string, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await debtsService.delete(req.userId!, req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getByAge(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await debtsService.getOrderedByAge(req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
