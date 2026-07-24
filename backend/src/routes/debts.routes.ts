import { Router } from "express";
import { debtsController } from "../controllers/debts.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createDebtSchema,
  updateDebtSchema,
  debtParamsSchema,
} from "../validators/debts.schema";

const router = Router();

router.use(authMiddleware);

router.get("/", debtsController.list);
router.get("/by-age", debtsController.getByAge);
router.get("/:id", validate(debtParamsSchema, "params"), debtsController.getById);
router.post("/", validate(createDebtSchema), debtsController.create);
router.patch("/:id", validate(debtParamsSchema, "params"), validate(updateDebtSchema), debtsController.update);
router.delete("/:id", validate(debtParamsSchema, "params"), debtsController.delete);

export default router;
