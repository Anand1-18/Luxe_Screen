import "../prisma/load-env.js";

import { createApp } from "./app.js";
import { disconnect } from "./lib/db.js";

const port = Number(process.env.PORT ?? 4000);
const server = createApp().listen(port, () => {
  console.log(`Luxe Screens API listening on http://localhost:${port}/api`);
});

// Close the HTTP server and database pool cleanly on Ctrl+C or when the host stops the process.
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(async () => {
      await disconnect();
      process.exit(0);
    });
  });
}
