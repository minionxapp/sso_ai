import authService from "../service/auth-service.js";

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const result = await authService.forgotPassword(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export default { login, forgotPassword };
