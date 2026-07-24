import { type Request, type Response, type NextFunction } from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} no encontrado`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401);
  }
}

export class InsufficientBalanceError extends AppError {
  constructor() {
    super("El monto del abono excede el saldo pendiente", 400);
  }
}

export function errorHandler(
  err: Error & { code?: string; constraint?: string; detail?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  if (err.code === "23505") {
    res.status(409).json({
      error: "El registro ya existe",
      details: err.detail || "Valor duplicado",
    });
    return;
  }

  if (err.code === "23503") {
    res.status(400).json({
      error: "Operación no válida: el registro está siendo usado",
      details: err.detail,
    });
    return;
  }

  console.error("Error no manejado:", err);
  res.status(500).json({
    error: "Error interno del servidor",
  });
}
