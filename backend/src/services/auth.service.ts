import { supabaseAdmin } from "../config/supabaseAuthAdmin";
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
};
