import jwt from "jsonwebtoken";
import { APIError } from "../utils/APIError.js";
import { ACCESS_TOKEN_JWT } from "../config/index.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new APIError(401, "No token provided."));
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_JWT);
    req._id = decoded._id;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    next(new APIError(401, "Invalid token."));
  }
};
