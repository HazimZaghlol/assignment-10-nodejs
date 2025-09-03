import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { getIpCountry } from "../utils/countries.utils.js";
import MongoStore from "rate-limit-mongo/lib/mongoStore.js";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: async (req, res) => {
    const ip = req.headers["x-forwarded-for"] || req.ip;
    const { country_code } = await getIpCountry(ip);
    if (country_code === "EG") {
      return 10;
    }
    return 10;
  },
  statusCode: 429,
  requestPropertyName: "rateLimit",
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  legacyHeaders: false,
  keyGenerator: (req) => {
    let ip = ipKeyGenerator(req.headers["x-forwarded-for"] || req.ip);
    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
      ip = "127.0.0.1";
    }
    return `ip:${ip}_${req.path}`;
  },
  store: new MongoStore({
    uri: process.env.DATABASE_URL,
    collectionName: "rateLimits",
    expireTimeMs: 10 * 1000,
  }),
});
