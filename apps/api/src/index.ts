import { app } from "./app.js";
import { env } from "./config/env.js";

// Start the Express server on the port from env.ts.
app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
