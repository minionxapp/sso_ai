import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "sso_jwt_super_secret_key_development";

const createAuthCode = async (user, request) => {
    const { client_id, redirect_uri, code_challenge, code_challenge_method } = request;

    const app = await prismaClient.application.findUnique({
        where: { clientId: client_id }
    });
    
    if (!app || !app.isActive) {
        throw new ResponseError(400, "Invalid client_id");
    }

    const access = await prismaClient.userApplicationAccess.findUnique({
        where: { userId_applicationId: { userId: user.id, applicationId: app.id } }
    });
    
    if (!access && user.group !== 'admin') {
        throw new ResponseError(403, "User does not have access to this application");
    }

    const uris = JSON.parse(app.redirectUris || '[]');
    if (!uris.includes(redirect_uri)) {
        throw new ResponseError(400, "Invalid redirect_uri");
    }

    const code = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

    await prismaClient.authorizationCode.create({
        data: {
            code,
            clientId: client_id,
            userId: user.id,
            redirectUri: redirect_uri,
            codeChallenge: code_challenge,
            codeChallengeMethod: code_challenge_method || 'S256',
            expiresAt
        }
    });

    return code;
};

const exchangeToken = async (request) => {
    const { client_id, client_secret, code, redirect_uri, code_verifier } = request;

    const app = await prismaClient.application.findUnique({
        where: { clientId: client_id }
    });

    if (!app || app.clientSecret !== client_secret) {
        throw new ResponseError(401, "Invalid client credentials");
    }

    const authCode = await prismaClient.authorizationCode.findUnique({
        where: { code }
    });

    if (!authCode || authCode.used || authCode.clientId !== client_id || authCode.redirectUri !== redirect_uri || authCode.expiresAt < new Date()) {
        throw new ResponseError(400, "Invalid or expired authorization code");
    }

    if (authCode.codeChallengeMethod === 'S256') {
        const expectedChallenge = crypto.createHash('sha256').update(code_verifier).digest('base64url');
        if (expectedChallenge !== authCode.codeChallenge) {
            throw new ResponseError(400, "Invalid code verifier");
        }
    } else {
        if (code_verifier !== authCode.codeChallenge) {
            throw new ResponseError(400, "Invalid code verifier");
        }
    }

    await prismaClient.authorizationCode.update({
        where: { id: authCode.id },
        data: { used: true }
    });

    const user = await prismaClient.user.findUnique({
        where: { id: authCode.userId }
    });

    const access_token = jwt.sign({ sub: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' });
    const id_token = jwt.sign({
        sub: user.id,
        name: user.fullName,
        email: user.email,
        preferred_username: user.username,
        group: user.group
    }, jwtSecret, { expiresIn: '1h', issuer: process.env.ISSUER_URL || "http://localhost:3000", audience: client_id });

    return {
        access_token,
        id_token,
        token_type: "Bearer",
        expires_in: 3600
    };
};

const getUserInfo = async (token) => {
    try {
        const decoded = jwt.verify(token, jwtSecret);
        const user = await prismaClient.user.findUnique({
            where: { id: decoded.sub }
        });

        if (!user) throw new ResponseError(401, "User not found");

        return {
            sub: user.id,
            name: user.fullName,
            email: user.email,
            preferred_username: user.username,
            group: user.group
        };
    } catch (e) {
        throw new ResponseError(401, "Invalid token");
    }
};

export default { createAuthCode, exchangeToken, getUserInfo };
