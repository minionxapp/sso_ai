import Joi from "joi";

const loginValidation = Joi.object({
    username: Joi.string().max(100).required(),
    password: Joi.string().max(100).required()
});

const forgotPasswordValidation = Joi.object({
    email: Joi.string().email().max(100).required()
});

const resetPasswordValidation = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).max(100).required()
});

export { loginValidation, forgotPasswordValidation, resetPasswordValidation };
