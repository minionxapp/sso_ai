import crypto from "crypto";
import { ResponseError } from "../error/response-error.js";
import auditService from "../service/audit-service.js";

const verifyHmac = (req, res, next) => {
    const signature = req.headers['x-hris-signature'];
    const secret = process.env.HRIS_WEBHOOK_SECRET || "default_secret";

    if (!signature) {
        throw new ResponseError(401, "Missing webhook signature");
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
    const checksum = Buffer.from(signature, 'utf8');

    if (digest.length !== checksum.length || !crypto.timingSafeEqual(digest, checksum)) {
        throw new ResponseError(401, "Invalid webhook signature");
    }

    // Log the webhook access
    auditService.logAction({
        tenantId: "system", actorId: "hris", action: "WEBHOOK_ACCESS", targetType: "SYSTEM", metadata: { ip: req.ip }
    });

    next();
};

export { verifyHmac };
