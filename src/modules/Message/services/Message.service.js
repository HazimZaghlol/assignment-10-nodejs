import { Message } from "../../../DB/models/Message.js";
import { User } from "../../../DB/models/Users.js";

// *************************************** createMessage  ***********************************
export const createMessage = async (req, res, next) => {
  const { content } = req.body;
  const { receiverId } = req.params;

  if (!content) {
    return next({ status: 400, message: "Content and receiverId are required" });
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return next({ status: 404, message: "user not found" });
  }

  const message = await Message.create({
    content,
    receiverId,
    receiverModel: "User",
  });

  res.status(201).json({
    message: "Message created successfully",
    data: message,
  });
};
// *************************************** makeMessagePublic (by owner) ***********************************
export const makeMessagePublic = async (req, res, next) => {
  const { messageId } = req.params;
  const userId = req.userId;
  if (!messageId) {
    return next({ status: 400, message: "Message ID is required" });
  }
  const message = await Message.findById(messageId);
  if (!message) {
    return next({ status: 404, message: "Message not found" });
  }
  // Only allow owner (receiverId) to make public
  if (message.receiverId.toString() !== userId) {
    return res.status(403).json({ message: "You are not authorized to make this message public" });
  }
  message.isPublic = true;
  await message.save();
  res.status(200).json({ message: "Message is now public", data: message });
};

// *************************************** get all public Messages ***********************************
export const getAllPublicMessages = async (req, res, next) => {
  const messages = await Message.find({ isPublic: true })
    .populate([
      {
        path: "receiverId",
        model: "User",
        select: "firstName lastName email",
      },
    ])
    .exec();

  if (!messages.length) {
    return next({ status: 404, message: "No public messages found" });
  }

  res.status(200).json({
    message: "Public messages retrieved successfully",
    data: messages,
  });
};

// *************************************** getMessagesByName  ***********************************
export const getMessagesByName = async (req, res, next) => {
  const messages = await Message.find()
    .populate([
      {
        path: "receiverId",
        model: "User",
        select: "firstName lastName email",
      },
    ])
    .exec();

  if (!messages.length) {
    return next({ status: 404, message: "No messages found for this name" });
  }

  res.status(200).json({
    message: "Messages retrieved successfully",
    data: messages,
  });
};

// *************************************** deleteMessage (by owner) ***********************************
export const deleteMessage = async (req, res, next) => {
  const { messageId } = req.params;
  const userId = req.userId;
  if (!messageId) {
    return next({ status: 400, message: "Message ID is required" });
  }
  const message = await Message.findById(messageId);
  if (!message) {
    return next({ status: 404, message: "Message not found" });
  }

  if (message.receiverId.toString() !== userId) {
    return res.status(403).json({ message: "You are not authorized to delete this message" });
  }
  await message.deleteOne();
  res.status(200).json({ message: "Message deleted successfully" });
};

// *************************************** getMessagesForLoggedInUser  ***********************************
export const getMessagesForLoggedInUser = async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return next({ status: 401, message: "Unauthorized: No user ID found" });
  }
  const messages = await Message.find({ receiverId: userId })
    .populate([
      {
        path: "receiverId",
        model: "User",
        select: "firstName lastName email",
      },
    ])
    .exec();

  if (!messages.length) {
    return next({ status: 404, message: "No messages found for this user" });
  }

  res.status(200).json({
    message: "Messages for logged-in user retrieved successfully",
    data: messages,
  });
};
