import "./config.js";
import express from "express";
import connectDB from "./src/DB/db.connection.js";
import MessageController from "./src/modules/Message/Message.Controller.js";
import helmet from "helmet";
import cors from "cors";
import { apiLimiter } from "./src/Middlewares/rate-limiter.middleware.js";
import AuthController from "./src/modules/Users/controller/auth.Controller.js";
import UserController from "./src/modules/Users/controller/Users.Controller.js";
import { CronJob } from "cron";
import { User } from "./src/DB/models/Users.js";
import { Message } from "./src/DB/models/Message.js";
import { TokenBlacklist } from "./src/DB/models/blacklistedTokens.js";

const whitelist = [process.env.WHITELISTED_DOMAINS, undefined];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const job = new CronJob("* * * * *", async () => {
  const users = await User.find({ deletedAt: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
  for (const u of users) {
    if (u.profileImageHosted.public_id) {
      await deleteFolderFromCloudinary(u.profileImageHosted.public_id);
    }
  }
  await User.deleteMany({ deletedAt: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
  await Message.deleteMany({ receiverId: { $in: users.map((user) => user._id) } });
  await TokenBlacklist.deleteMany({ expiresAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
  console.log("Deleted users and their messages");
});
job.start();

const app = express();

app.use("/uploads", express.static("uploads"));
// app.use(apiLimiter);

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(UserController);
app.use(AuthController);
app.use(MessageController);

app.use(async (err, req, res, next) => {
  if (req.session && req.session.inTransaction) {
    await req.session.abortTransaction();
    req.session.endSession();
  }
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: err.error,
    stack: err.stack,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${process.env.PORT}`);
  });
});
