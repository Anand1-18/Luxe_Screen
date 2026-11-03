import cors from "cors";
import express from "express";

import { errorHandler, notFoundHandler } from "./lib/errors.js";
import { api } from "./routes.js";

/**
 * Builds the Express app (without starting it), so tests can call it directly.
 * Express 5 forwards errors thrown in async handlers to `errorHandler` automatically.
 */
export function createApp({ clientOrigin = process.env.CLIENT_ORIGIN } = {}) {
  const app = express();

  // Behind Render/Vercel proxies, trust X-Forwarded-For so req.ip is the real client IP.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  console.log("==================CLIENT_ORIGIN", clientOrigin);

  app.get("/", (_req, res) => {
    res.json({
      name: "Luxe Screens API",
      status: "running",
      endpoints: {
        health: "/api/health",
      },
    });
  });

  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    next();
  });

  // Only the configured frontend may call the API from a browser.
  // Comma-separated list, e.g. "https://luxe-screen.vercel.app,http://localhost:5173".
  const allowed = (clientOrigin ?? "https://luxe-screen-cmzx.vercel.app/").split(",").map((o) => o.trim());
  app.use(cors({ origin: allowed }));

  app.use(express.json({ limit: "100kb" }));

  app.use("/api", api);
  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
