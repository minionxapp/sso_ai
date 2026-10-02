import { prismaClient } from "../application/database.js";
import auditService from "./audit-service.js";
import crypto from "crypto";
import { ResponseError } from "../error/response-error.js";

const list = async (user) => {
    const apps = await prismaClient.application.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' }
    });

    return apps.map(app => ({
        ...app,
        redirectUris: JSON.parse(app.redirectUris || '[]'),
        postLogoutUris: JSON.parse(app.postLogoutUris || '[]')
    }));
};

const create = async (user, request) => {
    if (!request.name || !request.redirectUris) {
        throw new ResponseError(400, "Application name and redirect URIs are required");
    }

    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');

    const redirectUris = Array.isArray(request.redirectUris)
        ? request.redirectUris
        : [request.redirectUris];

    const postLogoutUris = Array.isArray(request.postLogoutUris)
        ? request.postLogoutUris
        : (request.postLogoutUris ? [request.postLogoutUris] : []);

    const app = await prismaClient.application.create({
        data: {
            tenantId: user.tenantId,
            clientId: clientId,
            clientSecret: clientSecret,
            name: request.name,
            description: request.description || '',
            redirectUris: JSON.stringify(redirectUris),
            postLogoutUris: JSON.stringify(postLogoutUris),
            isThirdParty: request.isThirdParty || false,
            isActive: true
        }
    });

    await auditService.logAction({
        tenantId: user.tenantId,
        actorId: user.id,
        action: "CREATE_APPLICATION",
        targetType: "APPLICATION",
        targetId: app.id,
        metadata: { name: app.name, clientId: app.clientId }
    });

    return {
        ...app,
        redirectUris: redirectUris,
        postLogoutUris: postLogoutUris
    };
};

const deleteApp = async (user, appId) => {
    const count = await prismaClient.application.count({
        where: { id: appId, tenantId: user.tenantId }
    });
    if (count !== 1) throw new ResponseError(404, "Application is not found");

    await prismaClient.application.delete({
        where: { id: appId }
    });

    await auditService.logAction({
        tenantId: user.tenantId,
        actorId: user.id,
        action: "DELETE_APPLICATION",
        targetType: "APPLICATION",
        targetId: appId
    });

    return { message: "Application deleted successfully" };
};
const getUsers = async (user, appId) => {
    // Pastikan app milik tenant
    const count = await prismaClient.application.count({
        where: { id: appId, tenantId: user.tenantId }
    });
    if (count !== 1) throw new ResponseError(404, "Application is not found");

    const users = await prismaClient.user.findMany({
        where: { tenantId: user.tenantId },
        select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            appAccesses: {
                where: { applicationId: appId }
            }
        }
    });

    return users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        fullName: u.fullName,
        hasAccess: u.appAccesses.length > 0
    }));
};

const assignUsers = async (user, appId, userIds) => {
    const count = await prismaClient.application.count({
        where: { id: appId, tenantId: user.tenantId }
    });
    if (count !== 1) throw new ResponseError(404, "Application is not found");

    // Hapus akses lama
    await prismaClient.userApplicationAccess.deleteMany({
        where: { applicationId: appId }
    });

    // Tambahkan akses baru
    if (userIds && userIds.length > 0) {
        const data = userIds.map(uid => ({
            userId: uid,
            applicationId: appId
        }));
        await prismaClient.userApplicationAccess.createMany({
            data: data
        });
    }

    await auditService.logAction({
        tenantId: user.tenantId,
        actorId: user.id,
        action: "UPDATE_APP_ACCESS",
        targetType: "APPLICATION",
        targetId: appId,
        metadata: { assignedUsers: userIds }
    });

    return { message: "Application access updated successfully" };
};

export default { list, create, deleteApp, getUsers, assignUsers };
