import { prismaClient } from "../application/database.js";

const logAction = async ({ tenantId, actorId, action, targetType, targetId, ipAddress, userAgent, metadata }) => {
    try {
        await prismaClient.auditLog.create({
            data: {
                tenantId,
                actorId,
                action,
                targetType,
                targetId,
                ipAddress,
                userAgent,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
    } catch (e) {
        console.error("Audit log failed to save", e);
    }
};

const list = async (user, request = {}) => {
    const page = request.page ? parseInt(request.page) : 1;
    const size = request.size ? parseInt(request.size) : 20;
    const skip = (page - 1) * size;

    const where = { tenantId: user.tenantId };
    if (request.action) {
        where.action = { contains: request.action };
    }

    const logs = await prismaClient.auditLog.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
            actor: {
                select: { id: true, username: true, fullName: true, email: true }
            }
        }
    });

    const total = await prismaClient.auditLog.count({ where });

    return {
        data: logs,
        paging: {
            page,
            total_item: total,
            total_page: Math.ceil(total / size)
        }
    };
};

export default { logAction, list };
