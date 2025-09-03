import Joi from "joi";

export const genralRules = {
  email: Joi.string().email({ tlds: { allow: ["com", "net", "org", "edu", "gov", "io"], deny: ["xyz", "top", "club", "online"] } }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "password")

    .messages({
      "string.pattern.name": `
          Password must meet the following rules:
          - ensures there is at least one lowercase letter.
          - ensures there is at least one uppercase letter.
          - ensures there is at least one digit.
          - ensures there is at least one special character from @$!%*?&.
          - must be at least 8 characters long.
        `,
    }),
};
