import multer from "multer";
import fs from "fs";
import { allowedFilesExtensions, fileTypes } from "../Common/constants/files.constants.js";

function ensureFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}
export const uploadLocalFilesMiddleware = ({ folderPath = "sample", limits = {} }) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const filePath = `./uploads/${folderPath}`;
      ensureFolderExists(filePath);
      cb(null, filePath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    const fileKey = file.mimetype.split("/")[0].toUpperCase();
    const fileType = fileTypes[fileKey];
    if (!fileType) {
      cb(new Error("Only image files are allowed!"), false);
    }
    const fileExtension = file.mimetype.split("/")[1].toLowerCase();
    if (!allowedFilesExtensions[fileType].includes(fileExtension)) {
      cb(new Error(`Only ${fileType} files are allowed!`), false);
    }
    return cb(null, true);
  };

  return multer({ limits, fileFilter, storage });
};

// upload on cloudinary
export const uploadCloudinaryMiddleware = ({ limits = {} }) => {
  const storage = multer.diskStorage({});
  const fileFilter = (req, file, cb) => {
    const fileKey = file.mimetype.split("/")[0].toUpperCase();
    const fileType = fileTypes[fileKey];
    if (!fileType) {
      cb(new Error("Only image files are allowed!"), false);
    }
    const fileExtension = file.mimetype.split("/")[1].toLowerCase();
    if (!allowedFilesExtensions[fileType].includes(fileExtension)) {
      cb(new Error(`Only ${fileType} files are allowed!`), false);
    }
    return cb(null, true);
  };

  return multer({ limits, fileFilter, storage });
};
