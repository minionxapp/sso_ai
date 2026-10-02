import express from "express";
import hrisController from "../controller/hris-controller.js";
import { verifyHmac } from "../middleware/hmac-middleware.js";

const hrisRouter = express.Router();

hrisRouter.post('/api/v1/webhooks/hris', verifyHmac, hrisController.handleWebhook);

export { hrisRouter };
