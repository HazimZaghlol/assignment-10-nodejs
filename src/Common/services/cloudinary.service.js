import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, options) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, options);
    return result;
  } catch (error) {
    throw new Error("Cloudinary upload failed");
  }
};

export const deleteFileFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error("Cloudinary deletion failed");
  }
};

export const clearFolderFromCloudinary = async (folderPath) => {
  const result = await cloudinary.api.delete_resources_by_prefix(folderPath);
  return result;
};

export const deleteFolderFromCloudinary = async (folderPath) => {
  try {
    await clearFolderFromCloudinary(folderPath);
    const result = await cloudinary.api.delete_folder(folderPath);
    return result;
  } catch (error) {
    throw new Error("Cloudinary folder deletion failed");
  }
};
