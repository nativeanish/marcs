import dotenv from "dotenv";
dotenv.config();

import { config, isDev } from "./config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import authPlugin from "./plugins/auth";

const fastify = Fastify({
  logger: isDev,
  trustProxy: true,
});

// Security plugins
fastify.register(helmet);
fastify.register(cors, {
  origin: config.ALLOWED_ORIGINS,
  credentials: true,
});
fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Session handling
fastify.register(cookie);
fastify.register(session, {
  secret: config.SESSION_SECRET,
  cookie: {
    secure: !isDev,
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
      port: parseInt(config.PORT),
      host: "0.0.0.0",
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
