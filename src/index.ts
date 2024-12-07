import { config } from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import crypto from "crypto";
import authPlugin from "./plugins/auth";

config();

const fastify = Fastify({
  logger: true,
  trustProxy: true,
});

// Security plugins
fastify.register(helmet);
fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || false,
  credentials: true,
});
fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Session handling
fastify.register(cookie);
fastify.register(session, {
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
});

// Auth routes
fastify.register(authPlugin);

// Health check
fastify.get("/health", async () => ({ status: "ok" }));

const start = async () => {
  try {
    await fastify.listen({
      port: parseInt(process.env.PORT || "3000"),
      host: "0.0.0.0",
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
