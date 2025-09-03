import { Router } from "express";
import {
  DeleteUser,
  listUsers,
  UpdateUser,
  getUserProfile,
  uploadLocalFiles,
  uploadCloudinaryFiles,
  deleteCloudinaryFile,
  clearCloudinaryFolder,
  deleteCloudinaryFolder,
} from "../services/Users.service.js";
import { authMiddleware } from "../../../Middlewares/Authentication.middleware.js";
import { authorize } from "../../../Middlewares/Authorization.middleware.js";
import { PrivilegeEnum } from "../../../Common/enums/user.enum.js";
import { uploadCloudinaryMiddleware, uploadLocalFilesMiddleware } from "../../../Middlewares/multer.middleware.js";

const UserController = Router();

UserController.put("/user/updateUser", authMiddleware, UpdateUser);
UserController.delete("/user/deleteUser", authMiddleware, DeleteUser);
UserController.get("/users", authMiddleware, authorize(PrivilegeEnum.USER), listUsers);
UserController.get("/user/profile/:userId", getUserProfile);
UserController.post(
  "/uploads/user/uploadLocalFiles",
  authMiddleware,
  uploadLocalFilesMiddleware({
    limits: {
      fileSize: 1 * 1024 * 1024,
    },
    folderPath: "profiles",
  }).single("profile"),
  uploadLocalFiles
);

UserController.post(
  "/uploads/user/uploadCloudinaryFiles",
  authMiddleware,
  uploadCloudinaryMiddleware({
    limits: {
      fileSize: 1 * 1024 * 1024,
    },
  }).single("profile"),
  uploadCloudinaryFiles
);

UserController.delete("/uploads/user/deleteCloudinaryFile", authMiddleware, deleteCloudinaryFile);
UserController.delete("/uploads/user/clearCloudinaryFolder", authMiddleware, clearCloudinaryFolder);
UserController.delete("/uploads/user/deleteCloudinaryFolder", authMiddleware, deleteCloudinaryFolder);

export default UserController;
