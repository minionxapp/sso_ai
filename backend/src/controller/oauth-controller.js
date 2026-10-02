import oauthService from "../service/oauth-service.js";

const getOpenIdConfiguration = (req, res, next) => {
    try {
        const issuer = process.env.ISSUER_URL || "http://localhost:3000";
        res.status(200).json({
            issuer: issuer,
            authorization_endpoint: `${issuer}/oauth/authorize`,
            token_endpoint: `${issuer}/oauth/token`,
            userinfo_endpoint: `${issuer}/oauth/userinfo`,
            jwks_uri: `${issuer}/oauth/jwks`,
            response_types_supported: ["code", "token", "id_token"],
            subject_types_supported: ["public"],
            id_token_signing_alg_values_supported: ["RS256"],
            scopes_supported: ["openid", "profile", "email"],
            token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
            claims_supported: ["sub", "iss", "aud", "exp", "iat", "name", "email", "picture"]
        });
    } catch (e) {
        next(e);
    }
};

const authorize = async (req, res, next) => {
    try {
        const query = new URLSearchParams(req.query).toString();
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/oauth/authorize?${query}`);
    } catch (e) {
        next(e);
    }
};

const approveAuthorization = async (req, res, next) => {
    try {
        const code = await oauthService.createAuthCode(req.user, req.body);
        const redirectUrl = new URL(req.body.redirect_uri);
        redirectUrl.searchParams.append("code", code);
        redirectUrl.searchParams.append("state", req.body.state);
        
        res.status(200).json({ redirect_uri: redirectUrl.toString() });
    } catch (e) {
        next(e);
    }
};

const token = async (req, res, next) => {
    try {
        const result = await oauthService.exchangeToken(req.body);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
};

const userinfo = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token && token.startsWith('Bearer ')) {
            token = token.substring(7);
        } else {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const result = await oauthService.getUserInfo(token);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
};

export default { getOpenIdConfiguration, authorize, approveAuthorization, token, userinfo };
