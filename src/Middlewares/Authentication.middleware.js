import jwt from "jsonwebtoken";
import { TokenBlacklist } from "../DB/models/blacklistedTokens.js";
import { User } from "../DB/models/Users.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const blacklisted = await TokenBlacklist.findOne({ tokenId: decoded.jti });
    if (blacklisted) {
      return res.status(401).json({ message: "Unauthorized: Token revoked" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User no longer exists" });
    }

    req.userId = decoded.userId;
    req.jti = decoded.jti;
    req.tokenExp = decoded.exp;
    req.userRole = decoded.role;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
