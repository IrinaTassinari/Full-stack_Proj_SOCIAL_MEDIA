import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
export const optionalAuthMiddleware = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return next();
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, env.jwtSecret);
        const user = await User.findById(decoded.id).select("-password");
        if (user) {
            req.user = user;
        }
        next();
    }
    catch {
        next();
    }
};
