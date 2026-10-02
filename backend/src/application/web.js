import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { authRouter } from "../route/auth-api.js";
import { oauthRouter } from "../route/oauth-api.js";
import { userRouter } from "../route/user-api.js";
import { applicationRouter } from "../route/application-api.js";
import { roleRouter } from "../route/role-api.js";
import { hrisRouter } from "../route/hris-api.js";
import { auditRouter } from "../route/audit-api.js";

export const web = express();
web.use(helmet());
web.use(cors());
web.use(express.json());

web.use(authRouter);
web.use(oauthRouter);
web.use(userRouter);
web.use(applicationRouter);
web.use(roleRouter);
web.use(hrisRouter);
web.use(auditRouter);

web.get("/health-check", (req, res) => {
    res.status(200).json({ status: "OK", message: "SSO Service is running" });
});

web.use(errorMiddleware);
