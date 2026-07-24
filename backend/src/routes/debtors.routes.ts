import { Router } from "express";
import { debtorsController } from "../controllers/debtors.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createDebtorSchema,
  updateDebtorSchema,
  debtorParamsSchema,
} from "../validators/debtors.schema";

const router = Router();

router.use(authMiddleware);

router.get("/", debtorsController.list);
router.get("/:id", validate(debtorParamsSchema, "params"), debtorsController.getById);
router.post("/", validate(createDebtorSchema), debtorsController.create);
router.patch("/:id", validate(debtorParamsSchema, "params"), validate(updateDebtorSchema), debtorsController.update);
router.delete("/:id", validate(debtorParamsSchema, "params"), debtorsController.delete);

export default router;
