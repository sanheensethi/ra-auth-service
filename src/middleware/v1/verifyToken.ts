import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config/v1/config";
import logger from "../../logger/v1/logger";

export interface JwtUser {
  id: number;
  email: string;
  base_role: "COMPANY" | "WORKER" | "CONTRACTOR";
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    logger.warn(`No token provided. authorization: ${authHeader}`);
    res.status(403).json({ message: "No token provided." });
    return;
  }

  // Split 'Bearer' if it's present
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  if (!token) {
    logger.warn(`Malformed token. token: ${token}`);
    res.status(403).json({ message: "Malformed token." });
    return;
  }

  // Verify the token using the secret or fallback to the temp_jwt_key
  const jwtSecret = config['jwtSecret'];

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      logger.warn(`Failed to authenticate token. error: ${err}`);
      res.status(401).json({ message: "Failed to authenticate token." });
      return;
    }

    // Attach the decoded token's payload (such as user ID) to the request
    if (decoded && typeof decoded === "object") {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        base_role: decoded.base_role || "COMPANY" // Default to COMPANY if not provided
        } as JwtUser;
    }

    next();
  });
};

export default verifyToken;