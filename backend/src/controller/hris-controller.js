import hrisService from "../service/hris-service.js";

const handleWebhook = async (req, res, next) => {
    try {
        // Asumsi payload memiliki tenantId, atau diset secara default untuk single-tenant di webhook
        const tenantId = req.body.tenantId || "default-tenant"; 
        const result = await hrisService.handleWebhook(tenantId, req.body);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }
};

export default { handleWebhook };
