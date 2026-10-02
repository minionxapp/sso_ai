import roleService from "../service/role-service.js";

const createRole = async (req, res, next) => {
    try {
        const result = await roleService.createRole(req.user, req.body);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

const assignRole = async (req, res, next) => {
    try {
        const result = await roleService.assignRole(req.user, req.body);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

export default { createRole, assignRole };
