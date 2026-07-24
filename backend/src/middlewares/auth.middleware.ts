import { type Request, type Response, type NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import { AppError } from "./errorHandler.middleware";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next(new AppError("Token de autenticación requerido", 401));
    }

    const token = header.slice(7);
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return next(new AppError("Token inválido o expirado", 401));
    }

    req.userId = data.user.id;
    next();
  } catch (err) {
    next(new AppError("Error de autenticación", 500));
  }
}
