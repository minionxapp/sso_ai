import Joi from "joi";

const createUserValidation = Joi.object({
    email: Joi.string().email().max(100).required(),
    username: Joi.string().max(100).required(),
    password: Joi.string().min(8).max(100).required(),
    fullName: Joi.string().max(100).required(),
    group: Joi.string().valid("admin", "user").optional().default("user"),
    employeeId: Joi.string().max(100).optional().allow(null, "")
});

const updateUserValidation = Joi.object({
    id: Joi.string().required(),
    fullName: Joi.string().max(100).optional(),
    group: Joi.string().valid("admin", "user").optional(),
    avatarUrl: Joi.string().uri().max(255).optional(),
    employeeId: Joi.string().max(100).optional().allow(null, "")
});

const searchUserValidation = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10),
    name: Joi.string().optional(),
    email: Joi.string().optional()
});

const changeStatusValidation = Joi.object({
    id: Joi.string().required(),
    isActive: Joi.boolean().required()
});

const adminResetPasswordValidation = Joi.object({
    id: Joi.string().required(),
    newPassword: Joi.string().min(8).max(100).required()
});

export { 
    createUserValidation, 
    updateUserValidation, 
    searchUserValidation, 
    changeStatusValidation, 
    adminResetPasswordValidation 
};
