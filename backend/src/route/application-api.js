import express from "express";
import applicationController from "../controller/application-controller.js";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth-middleware.js";

const applicationRouter = express.Router();
applicationRouter.use('/api/applications', authMiddleware);

applicationRouter.get('/api/applications', adminOnlyMiddleware, applicationController.list);
applicationRouter.post('/api/applications', adminOnlyMiddleware, applicationController.create);
applicationRouter.delete('/api/applications/:appId', adminOnlyMiddleware, applicationController.remove);
applicationRouter.get('/api/applications/:appId/users', adminOnlyMiddleware, applicationController.getUsers);
applicationRouter.post('/api/applications/:appId/users', adminOnlyMiddleware, applicationController.assignUsers);

export { applicationRouter };
