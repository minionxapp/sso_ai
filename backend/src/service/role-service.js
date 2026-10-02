import { prismaClient } from "../application/database.js";
import auditService from "./audit-service.js";
import { ResponseError } from "../error/response-error.js";

const createRole = async (user, request) => {
    if (!request.name) throw new ResponseError(400, "Role name is required");

    const role = await prismaClient.role.create({
        data: {
            tenantId: user.tenantId,
            name: request.name,
            description: request.description
        }
    });

    await auditService.logAction({
        tenantId: user.tenantId, actorId: user.id,
        action: "CREATE_ROLE", targetType: "ROLE", targetId: role.id
    });

    return role;
}

const assignRole = async (user, request) => {
    if (!request.userId || !request.roleId) throw new ResponseError(400, "User ID and Role ID are required");

    await prismaClient.userRole.create({
        data: {
            userId: request.userId,
            roleId: request.roleId
        }
    });

    await auditService.logAction({
        tenantId: user.tenantId, actorId: user.id,
        action: "ASSIGN_ROLE", targetType: "USER", targetId: request.userId,
        metadata: { roleId: request.roleId }
    });

    return { message: "Role assigned successfully" };
}

export default { createRole, assignRole };
