import express from "express";
import oauthController from "../controller/oauth-controller.js";

const oauthRouter = express.Router();

import { authMiddleware } from "../middleware/auth-middleware.js";

oauthRouter.get('/.well-known/openid-configuration', oauthController.getOpenIdConfiguration);
oauthRouter.get('/oauth/authorize', oauthController.authorize);
oauthRouter.post('/oauth/token', oauthController.token);
oauthRouter.get('/oauth/userinfo', oauthController.userinfo);
oauthRouter.post('/oauth/userinfo', oauthController.userinfo); // userinfo allows GET & POST

oauthRouter.post('/api/oauth/authorize', authMiddleware, oauthController.approveAuthorization);

export { oauthRouter };
