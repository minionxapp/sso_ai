import auditService from "../service/audit-service.js";

const list = async (req, res, next) => {
    try {
        const result = await auditService.list(req.user, req.query);
        res.status(200).json(result);
    } catch (e) { next(e); }
};

export default { list };
