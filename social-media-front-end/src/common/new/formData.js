import Joi from "joi";

export const schemas = {
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .label("Email")
    .max(255),
  firstName: Joi.string().min(3).max(16),
  lastName: Joi.string().min(3).max(16),
  username: Joi.string().trim().lowercase().min(1).max(16),
  password: Joi.string()
    .required()
    .label("Password")
    .min(6)
    .max(32)
    .pattern(/(?=(?:.*[0-9]){1,16}).+/)
    .messages({
      "string.pattern.base": "{#label} must contain at least one number",
    }),
  confirmPassword: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .messages({
      "any.only": "{#label} does not match the original Password.",
    }),
  bio: Joi.string().min(1).max(64),
};
