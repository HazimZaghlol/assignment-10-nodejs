import dotenv from "dotenv";
import express from "express";
import connectDB from "./src/DB/db.connection.js";
import UsersController from "./src/modules/Users/Users.Controller.js";
import MessageController from "./src/modules/Message/Message.Controller.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(UsersController);
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
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
});
