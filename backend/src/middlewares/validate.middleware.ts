import { type Request, type Response, type NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import { AppError } from "./errorHandler.middleware";

export function validate(schema: ZodSchema, source: "body" | "params" | "query" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        throw new AppError("Error de validación", 400, details);
      }
      next(error);
    }
  };
}
