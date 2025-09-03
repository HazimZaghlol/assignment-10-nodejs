import { compareSync, decryptPhone, encryptPhone, hashSync } from "../../../utils/crypto.utils.js";
import { User } from "../../../DB/models/Users.js";
import { TokenBlacklist } from "../../../DB/models/blacklistedTokens.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmailEvent } from "../../../utils/send-Email.js";
import { SentEmail } from "../../../DB/models/SentEmail.js";
import { generateOTP } from "../../../utils/OTP.js";

// *************************************** SignUp ***************************************

export const SignUp = async (req, res) => {
  const { firstName, lastName, email, password, phone, gender, age } = req.body;

  if (!firstName || !lastName || !email || !password || !gender || !age) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "User with this email already exists" });
  }

  const hashedPassword = await hashSync(password);

  let encryptedPhone = null;
  if (phone) {
    encryptedPhone = encryptPhone(phone);
  }

  const otpPlain = generateOTP();
  const confirmationOTP = await hashSync(otpPlain);

  const user = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone: encryptedPhone,
    gender,
    age,
    otps: { confirmation: confirmationOTP },
  });

  await user.save();

  const emailData = {
    to: user.email,
    subject: "🎉 Welcome to Our App",
    html: `
        <h2>Hi ${user.firstName} 👋</h2>
        <p>Thanks for signing up to our platform. We're excited to have you on board! 🚀</p>
        <h3>OTP: ${otpPlain}</h3>
        <p>Here are your details:</p>
        <ul>
          <li><strong>Full Name:</strong> ${user.fullName}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Gender:</strong> ${user.gender}</li>
          <li><strong>Age:</strong> ${user.age}</li>
        </ul>
        <br/>
        <p>Best regards,<br/>The Team</p>
      `,
    type: "signup-otp",
  };
  sendEmailEvent(emailData);
  await SentEmail.create(emailData);

  res.status(201).json({
    message: "User created successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: encryptedPhone,
      gender: user.gender,
      age: user.age,
    },
  });
};

// *************************************** Confirm Password ***************************************
export const ConfirmPassword = async (req, res, next) => {
  const { email, otp } = req.body;
  if (!otp || !email) {
    return next({ status: 400, message: "Email and OTP are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next({ status: 404, message: "User not found" });
  }

  const isMatch = await compareSync(otp, user.otps.confirmation);
  if (!isMatch) {
    return next({ status: 401, message: "Invalid OTP" });
  }

  user.isConfirmed = true;
  user.otps.confirmation = undefined;
  await user.save();

  res.status(200).json({
    message: "User confirmed successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ? decryptPhone(user.phone) : null,
      gender: user.gender,
      age: user.age,
      isConfirmed: user.isConfirmed,
    },
  });
};

// *************************************** SignIn ***************************************
export const SignIn = async (req, res, next) => {
  const { email, password } = req.body;
  const deviceId = req.headers["x-device-id"] || req.body.deviceId;

  if (!email || !password) {
    return next({ status: 400, message: "Email and password are required" });
  }
  if (!deviceId) {
    return next({ status: 400, message: "Device ID is required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.deletedAt) {
    return res.status(410).json({ message: "User account has been deleted" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Device restriction logic
  const deviceExists = user.devices && user.devices.some((d) => d.deviceId === deviceId);
  if (!deviceExists) {
    if (user.devices && user.devices.length >= 2) {
      return res.status(403).json({ message: "Maximum devices reached. Please logout from another device first." });
    }
    user.devices = user.devices || [];
    user.devices.push({ deviceId, lastLogin: new Date() });
  } else {
    user.devices = user.devices.map((d) => (d.deviceId === deviceId ? { ...d, lastLogin: new Date() } : d));
  }
  await user.save();

  const jti = crypto.randomUUID();
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
    jwtid: jti,
  });

  const refreshToken = jwt.sign({ userId: user._id, Role: user.role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
    jwtid: jti,
  });

  res.status(200).json({
    token,
    refreshToken,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ? decryptPhone(user.phone) : null,
      gender: user.gender,
      age: user.age,
    },
  });
};

// *************************************** Logout  ***************************************
export const Logout = async (req, res) => {
  const user = await User.findById(req.userId);
  console.log(user);

  const deviceId = req.headers["x-device-id"] || req.body.deviceId;
  if (!req.jti) {
    return res.status(400).json({ message: "Token missing jti" });
  }

  await TokenBlacklist.create({
    tokenId: req.jti,
    expiresAt: new Date(req.tokenExp * 1000),
  });

  // Remove device from user's devices array
  if (req.userId && deviceId) {
    await User.findByIdAndUpdate(req.userId, {
      $pull: { devices: { deviceId } },
    });
  }

  res.status(200).json({ message: "Logged out successfully" });
};

// *************************************** Refresh Token  ***********************************
export const refreshToken = async (req, res, next) => {
  const { refreshtoken } = req.headers;

  if (!refreshtoken) {
    return next({ status: 400, message: "Token is required" });
  }

  const decoded = jwt.verify(refreshtoken, process.env.JWT_REFRESH_SECRET);
  const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRATION),
    jwtid: crypto.randomUUID(),
  });

  res.status(200).json({ token: newToken });
};

// *************************************** Request Password Reset ***********************************
export const requestPasswordReset = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next({ status: 400, message: "Email is required" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next({ status: 404, message: "User not found" });
  }
  const otpPlain = generateOTP();
  const resetOTP = await hashSync(otpPlain);
  user.otps.resetPassword = resetOTP;
  user.otps.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save();
  const emailData = {
    to: user.email,
    subject: "Password Reset Request",
    html: `<h2>Hi ${user.firstName}</h2><p>Your password reset OTP is: <strong>${otpPlain}</strong></p>`,
    type: "reset-password-otp",
  };
  sendEmailEvent(emailData);
  await SentEmail.create(emailData);

  res.status(200).json({ message: "Password reset OTP sent to email" });
};

// *************************************** Reset Password ***********************************
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return next({ status: 400, message: "Email, OTP, and new password are required" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next({ status: 404, message: "User not found" });
  }

  if (!user.otps.resetPassword || Date.now() > user.otps.resetPasswordExpires) {
    return next({ status: 401, message: "OTP expired or not found" });
  }

  const isMatch = await compareSync(otp, user.otps.resetPassword);
  if (!isMatch) {
    return next({ status: 401, message: "Invalid OTP" });
  }
  user.password = await hashSync(newPassword);
  user.otps.resetPassword = undefined;
  user.otps.resetPasswordExpires = undefined;
  await user.save();
  res.status(200).json({ message: "Password reset successfully" });
};

// *************************************** Update Password ***********************************
export const updatePassword = async (req, res, next) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old and new password are required" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await compareSync(oldPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Old password is incorrect" });
  }
  user.password = await hashSync(newPassword);
  await user.save();

  if (req.jti && req.tokenExp) {
    await TokenBlacklist.create({
      tokenId: req.jti,
      expiresAt: new Date(req.tokenExp * 1000),
    });
  }

  res.status(200).json({ message: "Password updated and current token revoked. Please login again." });
};

// *************************************** resendEmail ***********************************
export const resendEmail = async (req, res, next) => {
  const { emailId } = req.params;
  const emailRecord = await SentEmail.findById(emailId);
  if (!emailRecord) {
    return res.status(404).json({ message: "Email record not found" });
  }
  await sendEmailEvent({
    to: emailRecord.to,
    subject: emailRecord.subject,
    html: emailRecord.html,
  });
  res.status(200).json({ message: "Email resent successfully" });
};
