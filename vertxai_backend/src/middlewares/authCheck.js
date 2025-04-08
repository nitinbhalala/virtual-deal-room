import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const authCheck = (requiredRole) => async (req, res, next) => {
  let token;

  // 🔐 Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    // ✅ Decode token and extract user
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { user } = decoded;

    if (!user) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    // ✅ Check role authorization
    const isAuthorized =
      typeof requiredRole === "string"
        ? user.role === requiredRole
        : Array.isArray(requiredRole) && requiredRole.includes(user.role);

    if (!isAuthorized) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // ✅ Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authCheck;
