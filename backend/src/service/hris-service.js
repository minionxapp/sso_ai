import { prismaClient } from "../application/database.js";
import userService from "./user-service.js";
import crypto from "crypto";
import auditService from "./audit-service.js";

const handleWebhook = async (tenantId, payload) => {
    const { event, employee } = payload;
    
    if (event === "employee.hired") {
        // Otomasi Onboarding
        const defaultPassword = crypto.randomBytes(8).toString('hex');
        try {
            await userService.create({ tenantId, id: 'hris-system' }, {
                email: employee.email,
                username: employee.email.split('@')[0],
                password: defaultPassword,
                fullName: employee.fullName,
                employeeId: employee.employeeId
            });
            // In a real app: Send email with defaultPassword to employee
        } catch (e) {
            console.error("Failed to onboard from HRIS:", e);
        }
    } else if (event === "employee.terminated" || event === "employee.resigned") {
        // Otomasi Offboarding
        const user = await prismaClient.user.findFirst({
            where: { employeeId: employee.employeeId, tenantId }
        });
        if (user) {
            await userService.changeStatus({ tenantId, id: 'hris-system' }, {
                id: user.id,
                isActive: false
            });
        }
    } else {
        await auditService.logAction({
            tenantId, actorId: "hris", action: "UNKNOWN_WEBHOOK", targetType: "WEBHOOK", metadata: { event }
        });
    }

    return { message: "Webhook processed successfully" };
}

export default { handleWebhook };
