import express from "express";
import userController from "../controller/user-controller.js";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/auth-middleware.js";

const userRouter = express.Router();
userRouter.use('/api/users', authMiddleware);

// Regular user can access their own profile info if requested
// Admin-only endpoints:
userRouter.post('/api/users', adminOnlyMiddleware, userController.create);
userRouter.get('/api/users/:userId', adminOnlyMiddleware, userController.get);
userRouter.put('/api/users/:userId', adminOnlyMiddleware, userController.update);
userRouter.get('/api/users', adminOnlyMiddleware, userController.search);
userRouter.patch('/api/users/:userId/status', adminOnlyMiddleware, userController.changeStatus);
userRouter.post('/api/users/:userId/reset-password', adminOnlyMiddleware, userController.adminResetPassword);
userRouter.delete('/api/users/:userId', adminOnlyMiddleware, userController.remove);

export { userRouter };
