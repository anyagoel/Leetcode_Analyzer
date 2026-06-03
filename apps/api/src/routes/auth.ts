import crypto from "crypto";
import { Router } from "express";

import { pool } from "../db/pool.js";
import { createToken, hashPassword, verifyPassword } from "../utils/auth.js";

export const authRouter = Router();

authRouter.post("/register", async (request, response) => {
  const { name, email, password } = request.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    response.status(400).json({ message: "Name, email, and password are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);

  if (existingUser.rowCount) {
    response.status(409).json({ message: "An account with that email already exists." });
    return;
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await pool.query(
    `
      INSERT INTO users (id, name, email, password_hash)
      VALUES ($1, $2, $3, $4)
    `,
    [userId, name.trim(), normalizedEmail, passwordHash]
  );

  response.status(201).json({
    token: createToken(userId, normalizedEmail),
    user: {
      id: userId,
      name: name.trim(),
      email: normalizedEmail
    }
  });
});

authRouter.post("/login", async (request, response) => {
  const { email, password } = request.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    response.status(400).json({ message: "Email and password are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const result = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email = $1",
    [normalizedEmail]
  );
  const user = result.rows[0] as
    | { id: string; name: string; email: string; password_hash: string }
    | undefined;

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    response.status(401).json({ message: "Invalid credentials." });
    return;
  }

  response.json({
    token: createToken(user.id, user.email),
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

