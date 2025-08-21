import bcrypt from "bcryptjs";
import crypto from "crypto";

/* ----------------------------- hashing  ---------------------------- */
export const hashSync = (plain) => bcrypt.hash(plain, 10);

export const compareSync = (plain, hashed) => bcrypt.compare(plain, hashed);

/* ----------------------------- Phone  ------------------------------- */
export const encryptPhone = (plainPhone) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(process.env.PHONE_SECRET_KEY, "utf8"), Buffer.from(process.env.PHONE_IV, "utf8"));
  let encrypted = cipher.update(plainPhone, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decryptPhone = (encryptedPhone) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(process.env.PHONE_SECRET_KEY, "utf8"), Buffer.from(process.env.PHONE_IV, "utf8"));
  let decrypted = decipher.update(encryptedPhone, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
