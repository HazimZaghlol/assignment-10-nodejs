import { Router } from "express";
import {
  ConfirmPassword,
  DeleteUser,
  listUsers,
  Logout,
  refreshToken,
  SignIn,
  SignUp,
  UpdateUser,
  requestPasswordReset,
  resetPassword,
  getUserProfile,
  updatePassword,
} from "./services/Users.service.js";
import { authMiddleware } from "../../Middlewares/Authentication.middleware.js";
import { authorize } from "../../Middlewares/Authorization.middleware.js";
import { PrivilegeEnum } from "../../Common/enums/user.enum.js";

const UserController = Router();

UserController.post("/user/createUsers", SignUp);
UserController.post("/user/signin", SignIn);
UserController.put("/user/updateUser", authMiddleware, UpdateUser);
UserController.delete("/user/deleteUser", authMiddleware, DeleteUser);
UserController.post("/user/logout", authMiddleware, Logout);
UserController.post("/user/confirm-password", ConfirmPassword);
UserController.get("/users", authMiddleware, authorize(PrivilegeEnum.USER), listUsers);
UserController.post("/user/refresh-token", refreshToken);
UserController.post("/user/Forget-password", requestPasswordReset);
UserController.post("/user/reset-password", resetPassword);
UserController.get("/user/profile/:userId", getUserProfile);
UserController.post("/user/update-password", authMiddleware, updatePassword);

export default UserController;
