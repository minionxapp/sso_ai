import userService from "../service/user-service.js";

const create = async (req, res, next) => {
    try {
        const result = await userService.create(req.user, req.body);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

const get = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const result = await userService.get(req.user, userId);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

const update = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const request = req.body;
        request.id = userId;
        const result = await userService.update(req.user, request);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

const search = async (req, res, next) => {
    try {
        const request = {
            name: req.query.name,
            email: req.query.email,
            page: req.query.page ? parseInt(req.query.page) : 1,
            size: req.query.size ? parseInt(req.query.size) : 10
        };
        const result = await userService.search(req.user, request);
        res.status(200).json(result);
    } catch (e) { next(e); }
};

const changeStatus = async (req, res, next) => {
    try {
        const request = {
            id: req.params.userId,
            isActive: req.body.isActive
        };
        const result = await userService.changeStatus(req.user, request);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

const adminResetPassword = async (req, res, next) => {
    try {
        const request = {
            id: req.params.userId,
            newPassword: req.body.newPassword
        };
        const result = await userService.adminResetPassword(req.user, request);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const result = await userService.deleteUser(req.user, userId);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

export default { create, get, update, search, changeStatus, adminResetPassword, remove };
