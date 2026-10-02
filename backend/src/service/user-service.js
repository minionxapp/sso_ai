import { prismaClient } from "../application/database.js";
import { validate } from "../validation/validation.js";
import { 
    createUserValidation, 
    updateUserValidation, 
    searchUserValidation,
    changeStatusValidation,
    adminResetPasswordValidation
} from "../validation/user-validation.js";
import { ResponseError } from "../error/response-error.js";
import auditService from "./audit-service.js";
import bcrypt from "bcrypt";

const create = async (user, request) => {
    const userReq = validate(createUserValidation, request);
    
    // Check existing
    const count = await prismaClient.user.count({
        where: {
            tenantId: user.tenantId,
            OR: [
                { email: userReq.email },
                { username: userReq.username }
            ]
        }
    });

    if (count === 1) {
        throw new ResponseError(400, "Email or Username already exists");
    }

    userReq.passwordHash = await bcrypt.hash(userReq.password, 10);
    delete userReq.password;
    userReq.tenantId = user.tenantId;

    const result = await prismaClient.user.create({
        data: userReq,
        select: { id: true, username: true, email: true, fullName: true, group: true, isActive: true }
    });

    await auditService.logAction({
        tenantId: user.tenantId, actorId: user.id,
        action: "CREATE_USER", targetType: "USER", targetId: result.id
    });

    return result;
}

const get = async (user, userId) => {
    const targetUser = await prismaClient.user.findFirst({
        where: { id: userId, tenantId: user.tenantId },
        select: { id: true, username: true, email: true, fullName: true, group: true, employeeId: true, isActive: true, isLocked: true }
    });
    if (!targetUser) throw new ResponseError(404, "User is not found");
    return targetUser;
}

const update = async (user, request) => {
    const userReq = validate(updateUserValidation, request);
    const count = await prismaClient.user.count({
        where: { id: userReq.id, tenantId: user.tenantId }
    });
    if (count !== 1) throw new ResponseError(404, "User is not found");

    const data = {};
    if (userReq.fullName) data.fullName = userReq.fullName;
    if (userReq.group) data.group = userReq.group;
    if (userReq.avatarUrl) data.avatarUrl = userReq.avatarUrl;
    if (userReq.employeeId !== undefined) data.employeeId = userReq.employeeId;

    const result = await prismaClient.user.update({
        where: { id: userReq.id },
        data: data,
        select: { id: true, username: true, email: true, fullName: true, group: true }
    });

    await auditService.logAction({
        tenantId: user.tenantId, actorId: user.id,
        action: "UPDATE_USER", targetType: "USER", targetId: result.id, metadata: data
    });

    return result;
}

const changeStatus = async (user, request) => {
    const req = validate(changeStatusValidation, request);
    const count = await prismaClient.user.count({
        where: { id: req.id, tenantId: user.tenantId }
    });
    if (count !== 1) throw new ResponseError(404, "User is not found");

    await prismaClient.user.update({
        where: { id: req.id },
        data: { isActive: req.isActive }
    });

    if (!req.isActive) {
        // Todo: Cabut semua refresh token atau sesi OAuth aktif
        await prismaClient.refreshToken.updateMany({
            where: { userId: req.id },
            data: { isRevoked: true }
        });
    }

    await auditService.logAction({
        tenantId: user.tenantId, actorId: user.id,
        action: req.isActive ? "ENABLE_USER" : "DISABLE_USER", 
        targetType: "USER", targetId: req.id
    });

    return { message: "Status updated successfully" };
}

const adminResetPassword = async (user, request) => {
    const req = validate(adminResetPasswordValidation, request);
    const count = await prismaClient.user.count({
        where: { id: req.id, tenantId: user.tenantId }
    });
    if (count !== 1) throw new ResponseError(404, "User is not found");

    const passwordHash = await bcrypt.hash(req.newPassword, 10);
    
    await prismaClient.user.update({
        where: { id: req.id },
        data: { passwordHash, isLocked: false, failedAttempts: 0 }
    });

    await auditService.logAction({
        tenantId: user.tenantId, actorId: user.id,
        action: "ADMIN_RESET_PASSWORD", targetType: "USER", targetId: req.id
    });

    return { message: "Password reset successfully" };
}

const search = async (user, request) => {
    const req = validate(searchUserValidation, request);
    const skip = (req.page - 1) * req.size;

    const filters = [{ tenantId: user.tenantId }];
    if (req.name) filters.push({ fullName: { contains: req.name } });
    if (req.email) filters.push({ email: { contains: req.email } });

    const users = await prismaClient.user.findMany({
        where: { AND: filters },
        skip: skip,
        take: req.size,
        select: { id: true, username: true, email: true, fullName: true, group: true, isActive: true }
    });

    const totalItems = await prismaClient.user.count({
        where: { AND: filters }
    });

    return {
        data: users,
        paging: {
            page: req.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / req.size)
        }
    };
}

const deleteUser = async (user, userId) => {
    const count = await prismaClient.user.count({
        where: { id: userId, tenantId: user.tenantId }
    });
    if (count !== 1) throw new ResponseError(404, "User is not found");

    await prismaClient.user.delete({
        where: { id: userId }
    });

    await auditService.logAction({
        tenantId: user.tenantId, actorId: user.id,
        action: "DELETE_USER", targetType: "USER", targetId: userId
    });

    return { message: "User deleted successfully" };
}

export default { create, get, update, changeStatus, search, adminResetPassword, deleteUser };
