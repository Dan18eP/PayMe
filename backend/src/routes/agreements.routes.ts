import { Router } from "express";
import { agreementsController } from "../controllers/agreements.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  generateAgreementSchema,
  signAgreementSchema,
} from "../validators/agreements.schema";
import { z } from "zod";

const router = Router();

const debtParamsSchema = z.object({
  debtId: z.string().uuid("ID de deuda inválido"),
});

router.post("/generate", authMiddleware, validate(generateAgreementSchema), agreementsController.generate);
router.post("/sign", validate(signAgreementSchema), agreementsController.sign);
router.get("/debt/:debtId", authMiddleware, validate(debtParamsSchema, "params"), agreementsController.getByDebt);
router.get("/public/:token", agreementsController.getPublicByToken);

export default router;
