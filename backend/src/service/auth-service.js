import { prismaClient } from "../application/database.js";
import { validate } from "../validation/validation.js";
import { loginValidation, forgotPasswordValidation, resetPasswordValidation } from "../validation/auth-validation.js";
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const login = async (request) => {
    const loginRequest = validate(loginValidation, request);

    const user = await prismaClient.user.findFirst({
        where: {
            username: loginRequest.username
        }
    });

    if (!user) {
        throw new ResponseError(401, "Username or password wrong");
    }

    if (user.isLocked || !user.isActive) {
        throw new ResponseError(401, "Account is locked or inactive");
    }

    const isPasswordValid = await bcrypt.compare(loginRequest.password, user.passwordHash);
    if (!isPasswordValid) {
        // Implement failed attempt logic here
        throw new ResponseError(401, "Username or password wrong");
    }

    // Reset failed attempts & set last login
    await prismaClient.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lastLoginAt: new Date() }
    });

    // Generate JWT Access Token
    const jwtSecret = process.env.JWT_SECRET || "sso_jwt_super_secret_key_development";
    const token = jwt.sign({
        id: user.id,
        tenantId: user.tenantId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        group: user.group || "user"
    }, jwtSecret, { expiresIn: '24h' });

    return {
        id: user.id,
        tenantId: user.tenantId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        group: user.group || "user",
        token: token
    };
}

const forgotPassword = async (request) => {
    const { email } = validate(forgotPasswordValidation, request);
    const user = await prismaClient.user.findFirst({ where: { email } });

    if (!user) {
        // Silently succeed to prevent email enumeration
        return { message: "If your email is registered, a reset link will be sent." };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prismaClient.passwordResetToken.create({
        data: {
            userId: user.id,
            tokenHash: tokenHash,
            expiresAt: expiresAt
        }
    });

    // In real app, send email here with rawToken
    return { message: "If your email is registered, a reset link will be sent.", resetTokenRaw: rawToken };
}

export default { login, forgotPassword };
