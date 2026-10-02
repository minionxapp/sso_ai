import applicationService from "../service/application-service.js";

const list = async (req, res, next) => {
    try {
        const result = await applicationService.list(req.user);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

const create = async (req, res, next) => {
    try {
        const result = await applicationService.create(req.user, req.body);
        res.status(201).json({ data: result });
    } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
    try {
        const appId = req.params.appId;
        const result = await applicationService.deleteApp(req.user, appId);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};
const getUsers = async (req, res, next) => {
    try {
        const appId = req.params.appId;
        const result = await applicationService.getUsers(req.user, appId);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

const assignUsers = async (req, res, next) => {
    try {
        const appId = req.params.appId;
        const userIds = req.body.userIds;
        const result = await applicationService.assignUsers(req.user, appId, userIds);
        res.status(200).json({ data: result });
    } catch (e) { next(e); }
};

export default { list, create, remove, getUsers, assignUsers };
