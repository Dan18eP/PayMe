import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../config/supabaseAuthAdmin";
import { env } from "../config/env";
import { AppError } from "../middlewares/errorHandler.middleware";

export const authService = {
  async register(email: string, password: string) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes("already registered")) {
        throw new AppError("El correo ya está registrado", 409);
      }
      throw new AppError("Error al registrar usuario", 500);
    }

    return data.user;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError("Credenciales inválidas", 401);
    }

    return {
      user: data.user,
      session: data.session,
    };
  },

  async logout(token: string) {
    const { error } = await supabaseAdmin.auth.admin.signOut(token);
    if (error) {
      throw new AppError("Error al cerrar sesión", 500);
    }
  },

  async refresh(refreshToken: string) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) {
      throw new AppError("Sesión expirada. Inicia sesión de nuevo.", 401);
    }
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: data.user,
    };
  },
};
