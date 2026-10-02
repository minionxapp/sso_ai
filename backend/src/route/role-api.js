import express from "express";
import roleController from "../controller/role-controller.js";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth-middleware.js";

const roleRouter = express.Router();
roleRouter.use('/api/roles', authMiddleware, adminOnlyMiddleware);

roleRouter.post('/api/roles', roleController.createRole);
roleRouter.post('/api/roles/assign', roleController.assignRole);

export { roleRouter };
