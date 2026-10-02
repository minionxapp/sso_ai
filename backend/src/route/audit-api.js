import express from "express";
import auditController from "../controller/audit-controller.js";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth-middleware.js";

const auditRouter = express.Router();
auditRouter.use('/api/audit-logs', authMiddleware);

auditRouter.get('/api/audit-logs', adminOnlyMiddleware, auditController.list);

export { auditRouter };
