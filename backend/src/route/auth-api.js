import express from "express";
import authController from "../controller/auth-controller.js";

const authRouter = express.Router();

authRouter.post('/api/auth/login', authController.login);
authRouter.post('/api/auth/forgot-password', authController.forgotPassword);

export { authRouter };
