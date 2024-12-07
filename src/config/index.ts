import { validateEnv } from "./env";

export const config = validateEnv();

export const isDev = config.NODE_ENV === "development";
export const isProd = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";
