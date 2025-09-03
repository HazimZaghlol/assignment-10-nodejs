import { Router } from "express";


import { authMiddleware } from "../../../Middlewares/Authentication.middleware.js";
import { validateRequest } from "../../../Middlewares/validation.middleware.js";
import { signupSchema } from "../../../validators/Schemas/user.Schema.js";
import { ConfirmPassword, Logout, refreshToken, requestPasswordReset, resendEmail, resetPassword, SignIn, SignUp, updatePassword } from "../services/auth.service.js";


const AuthController = Router();

AuthController.post("/user/createUsers", validateRequest(signupSchema), SignUp);
AuthController.post("/user/signin", SignIn);
AuthController.post("/user/logout", authMiddleware, Logout);
AuthController.post("/user/confirm-password", ConfirmPassword);
AuthController.post("/user/refresh-token", refreshToken);
AuthController.post("/user/Forget-password", requestPasswordReset);
AuthController.post("/user/reset-password", resetPassword);
AuthController.post("/user/update-password", authMiddleware, updatePassword);
AuthController.post("/email/resend/:emailId", resendEmail);

export default AuthController;
