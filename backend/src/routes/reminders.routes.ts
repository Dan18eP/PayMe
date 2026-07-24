import { Router } from "express";
import { remindersController } from "../controllers/reminders.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { z } from "zod";

const router = Router();

router.use(authMiddleware);

const generateLinkSchema = z.object({
  debtId: z.string().uuid("ID de deuda inválido"),
  message: z.string().optional(),
});

router.post("/generate-link", validate(generateLinkSchema), remindersController.generateLink);

export default router;
