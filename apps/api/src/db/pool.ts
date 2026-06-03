import pg from "pg";

import { env } from "../config/env.js";

const { Pool } = pg;

// Create one shared PostgreSQL connection pool for the backend.
export const pool = new Pool({
  connectionString: env.databaseUrl
});
