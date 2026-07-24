import { Router } from "express";
import { paymentsController } from "../controllers/payments.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { registerPaymentSchema } from "../validators/payments.schema";
import { z } from "zod";

const router = Router();

router.use(authMiddleware);

const debtParamsSchema = z.object({
  debtId: z.string().uuid("ID de deuda inválido"),
});

router.post("/", validate(registerPaymentSchema), paymentsController.register);
router.get("/debt/:debtId", validate(debtParamsSchema, "params"), paymentsController.getByDebt);

export default router;
