import { NextFunction, Request, Response } from "express";

import { verifyToken } from "../utils/auth.js";

export type AuthenticatedRequest = Request & {
  userId?: string;
};

export function requireAuth(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.header("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  const payload = verifyToken(token);

  if (!payload) {
    response.status(401).json({ message: "Invalid or expired token." });
    return;
  }

  request.userId = payload.userId;
  next();
}

