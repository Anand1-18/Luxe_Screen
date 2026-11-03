// Loads server/.env.local, then server/.env (the first value found wins).
// Paths are resolved from this file, so it works no matter which folder a command runs from.
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const serverDir = fileURLToPath(new URL("..", import.meta.url));

config({ path: [`${serverDir}.env.local`, `${serverDir}.env`], quiet: true });
