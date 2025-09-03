import Joi from "joi";
import { GenderEnum } from "../../Common/enums/user.enum.js";
import { genralRules } from "../../utils/general.rules.js";

export const signupSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(50).messages({
      "string.empty": "First name cannot be empty",
      "string.min": "First name should have at least 2 characters",
      "string.max": "First name should have at most 50 characters",
      "any.required": "First name is required",
      "string.base": "First name must be a string",
    }),
    lastName: Joi.string().min(2).max(50),
    email: genralRules.email,
    password: genralRules.password,
    phone: Joi.string().pattern(/^\d{11}$/),
    gender: Joi.string().valid(...Object.values(GenderEnum)),
    age: Joi.number().integer().min(1).max(120),
  }).options({ presence: "required", abortEarly: false }),
};
