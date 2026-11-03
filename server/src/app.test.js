// HTTP-level tests for request validation and error handling.
// These requests are rejected before any database call, so no database is needed.
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "./app.js";

const app = createApp({ clientOrigin: "http://localhost:5173" });

describe("root route", () => {
  it("identifies the running backend and its health endpoint", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      name: "Luxe Screens API",
      status: "running",
      endpoints: { health: "/api/health" },
    });
  });
});

describe("API error handling", () => {
  it("returns 404 JSON for unknown API routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects malformed JSON with 400 INVALID_JSON", async () => {
    const res = await request(app)
      .post("/api/booking")
      .set("Content-Type", "application/json")
      .send("not json");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });

  it("returns field errors for an invalid booking", async () => {
    const res = await request(app)
      .post("/api/booking")
      .send({ guests: 0, customer: { phone: "123", email: "bad" } });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.fieldErrors).toHaveProperty("guests");
    expect(res.body.error.details.fieldErrors).toHaveProperty("customer");
  });

  it("validates slot query parameters", async () => {
    const res = await request(app).get("/api/slots?date=31-10-2026&location=x");
    expect(res.status).toBe(400);
    expect(res.body.error.details.fieldErrors).toHaveProperty("date");
  });
});

describe("security headers and CORS", () => {
  it("sends basic security headers and hides X-Powered-By", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("allows the configured frontend origin only", async () => {
    const allowed = await request(app).get("/api/x").set("Origin", "http://localhost:5173");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:5173");

    const blocked = await request(app).get("/api/x").set("Origin", "https://evil.example");
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("rate limiting", () => {
  it("returns 429 with Retry-After after 5 waitlist requests a minute", async () => {
    const limited = createApp();
    const statuses = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await request(limited).post("/api/waitlist").send({})).status);
    }
    expect(statuses.slice(0, 5)).toEqual([400, 400, 400, 400, 400]);
    expect(statuses[5]).toBe(429);
  });
});
