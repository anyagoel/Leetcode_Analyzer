import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET ?? "local-dev-secret";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type TokenPayload = {
  userId: string;
  email: string;
  expiresAt: number;
};

// Hash the user's password before saving it to the database.
export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt);
  return `${salt}:${derivedKey}`;
}

// Compare a login password with the stored password hash.
export async function verifyPassword(password: string, storedHash: string) {
  const [salt, savedKey] = storedHash.split(":");

  if (!salt || !savedKey) {
    return false;
  }

  const derivedKey = await scrypt(password, salt);
  return crypto.timingSafeEqual(Buffer.from(savedKey, "hex"), Buffer.from(derivedKey, "hex"));
}

// Create a simple signed token for future authenticated requests.
export function createToken(userId: string, email: string) {
  const payload: TokenPayload = {
    userId,
    email,
    expiresAt: Date.now() + TOKEN_TTL_MS
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

// Check whether a token is real and whether it has expired.
export function verifyToken(token: string): TokenPayload | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString()) as TokenPayload;

  if (payload.expiresAt < Date.now()) {
    return null;
  }

  return payload;
}

function sign(value: string) {
  return crypto.createHmac("sha256", TOKEN_SECRET).update(value).digest("base64url");
}

function scrypt(value: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(value, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey.toString("hex"));
    });
  });
}
