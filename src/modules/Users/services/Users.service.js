import { decryptPhone, encryptPhone } from "../../../utils/crypto.utils.js";
import { User } from "../../../DB/models/Users.js";
import mongoose from "mongoose";
import { Message } from "../../../DB/models/Message.js";
import { clearFolderFromCloudinary, deleteFileFromCloudinary, deleteFolderFromCloudinary, uploadToCloudinary } from "../../../Common/services/cloudinary.service.js";
import fs from "fs";


// *************************************** Update  ***************************************
export const UpdateUser = async (req, res) => {
  const userId = req.userId;
  const { firstName, lastName, phone, gender, age } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = encryptPhone(phone);
  if (gender) user.gender = gender;
  if (age) user.age = age;

  await user.save();

  res.status(200).json({
    message: "User updated successfully",
    user: {
      id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      phone: phone || user.phone,
      gender: user.gender,
      age: user.age,
    },
  });
};

// *************************************** Delete  ***************************************
export const DeleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  const userId = req.userId;
  req.session = session;

  session.startTransaction();

  // hard delete
  // const user = await User.findByIdAndDelete(userId, { session });

  // soft delete
  const user = await User.findByIdAndUpdate(userId, { deletedAt: new Date(), devices: [] }, { new: true, session });

  if (user.profileImageLocal) fs.unlinkSync(user.profileImageLocal);

  if (user.profileImageHosted.public_id) await deleteFileFromCloudinary(user.profileImageHosted.public_id);

  if (!user) {
    await session.abortTransaction();
    session.endSession();
    return next({ status: 404, message: "User not found" });
  }

  await Message.deleteMany({ receiverId: userId }, { session });



  await session.commitTransaction();
  session.endSession();

  return res.status(200).json({ message: "User and messages deleted successfully. All tokens revoked." });
};

// *************************************** List Users  ***********************************
export const listUsers = async (req, res, next) => {
  const users = await User.find().select("-otps").populate("Messages");

  if (!users || users.length === 0) {
    return next({ status: 404, message: "No users found" });
  }
  const Users = users.map((user) => {
    const { password, __v, ...rest } = user.toObject();
    return {
      ...rest,
      // Messages: user.Messages,
      phone: user.phone ? decryptPhone(user.phone) : null,
    };
  });
  res.status(200).json({
    count: Users.length,
    users: Users,
  });
};

// *************************************** Get User Profile ***********************************
export const getUserProfile = async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const user = await User.findById(userId).select("firstName lastName");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({
    firstName: user.firstName,
    lastName: user.lastName,
  });
};
// *************************************** upload local files ***********************************
export const uploadLocalFiles = async (req, res, next) => {
  const { path } = req.file;
  const userId = req.userId;

  const user = await User.findByIdAndUpdate(userId, { profileImageLocal: path }, { new: true });

  res.status(200).json({ message: "File uploaded successfully", user });
};
// *************************************** upload to cloud files ***********************************
export const uploadCloudinaryFiles = async (req, res, next) => {
  const { path } = req.file;
  const userId = req.userId;

  const { secure_url, public_id } = await uploadToCloudinary(path, {
    folder: "Sarah_app/Users/Profiles",
  });

  const uploadedResult = await User.findByIdAndUpdate(userId, { profileImageHosted: { secure_url, public_id } }, { new: true });

  res.status(200).json({ message: "File uploaded successfully", uploadedResult });
};

// *************************************** delete file from cloud ***********************************
export const deleteCloudinaryFile = async (req, res, next) => {
  const { public_id } = req.body;
  if (!public_id) {
    return res.status(400).json({ message: "public_id is required" });
  }
  const result = await deleteFileFromCloudinary(public_id);
  res.status(200).json({ message: "File deleted successfully", result });
};

// *************************************** clear folder from cloud ***********************************
export const clearCloudinaryFolder = async (req, res, next) => {
  const { folderPath } = req.body;
  console.log(folderPath);

  if (!folderPath) {
    return res.status(400).json({ message: "folderPath is required" });
  }
  const result = await clearFolderFromCloudinary(folderPath);
  res.status(200).json({ message: "Folder cleared successfully", result });
};
// *************************************** delete folder from cloud ***********************************
export const deleteCloudinaryFolder = async (req, res, next) => {
  const { folderPath } = req.body;
  if (!folderPath) {
    return res.status(400).json({ message: "folderPath is required" });
  }
  const result = await deleteFolderFromCloudinary(folderPath);
  res.status(200).json({ message: "Folder deleted successfully", result });
};
