import {
  FastifyPluginAsync,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";
import { providers } from "../providers";
import { generateAuthUrl, exchangeToken } from "../utils/auth-utils";
import { TokenResponseSchema, AuthState, BaseProfile } from "../types/auth";
import createError from "@fastify/error";

const AuthError = createError("AUTH_ERROR", "%s", 400);

declare module "fastify" {
  interface Session {
    authState?: AuthState;
    user?: BaseProfile;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get<{
    Params: { provider: string };
  }>(
    "/api/auth/:provider/login",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { provider: providerId } = request.params as { provider: string };
      const provider = providers[providerId];

      if (!provider) {
        throw new AuthError("Unsupported provider");
      }

      const redirectUri = `${request.protocol}://${request.hostname}/api/auth/${provider.id}/callback`;

      try {
        // Use custom sign-in if available, otherwise fall back to default
        const { url, codeVerifier, state } = provider.signIn
          ? await provider.signIn({ redirectUri })
          : generateAuthUrl(provider, redirectUri);

        // Store PKCE and state in session
        const authState: AuthState = {
          codeVerifier,
          state,
          provider: providerId,
        };

        request.session.authState = authState;
        await request.session.save();

        return reply.redirect(url);
      } catch (error) {
        fastify.log.error(error);
        throw new AuthError("Failed to generate authentication URL");
      }
    }
  );

  fastify.get<{
    Params: { provider: string };
    Querystring: { code: string; state?: string };
  }>(
    "/api/auth/:provider/callback",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { provider: providerId } = request.params as { provider: string };
      const { code, state } = request.query as { code: string; state?: string };
      const provider = providers[providerId];

      if (!provider) {
        throw new AuthError("Unsupported provider");
      }

      const authState = request.session.authState;

      if (!authState || authState.provider !== providerId) {
        throw new AuthError("Invalid session");
      }

      if (authState.state && authState.state !== state) {
        throw new AuthError("Invalid state parameter");
      }

      const redirectUri = `${request.protocol}://${request.hostname}/api/auth/${provider.id}/callback`;

      try {
        const tokenData = await exchangeToken(
          provider,
          code,
          redirectUri,
          authState.codeVerifier
        );

        const validatedToken = TokenResponseSchema.parse(tokenData);

        // Fetch user profile
        const userProfile = await provider.getProfile({
          access_token: validatedToken.access_token,
        });

        // Store user profile in session
        request.session.user = userProfile;
        request.session.authState = undefined;
        await request.session.save();

        return { user: userProfile, ...validatedToken };
      } catch (error) {
        fastify.log.error(error);
        throw new AuthError("Authentication failed");
      }
    }
  );

  // Get current user
  fastify.get("/api/auth/session", async (request) => {
    return { user: request.session.user || null };
  });

  // Logout
  fastify.post("/api/auth/logout", async (request, reply) => {
    request.session.destroy();
    return reply.send({ success: true });
  });

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof AuthError) {
      void reply.status(400).send({ error: error.message });
      return;
    }

    request.log.error(error);
    void reply.status(500).send({ error: "Internal Server Error" });
  });
};

export default fp(authPlugin, {
  name: "auth",
  dependencies: ["@fastify/session"],
});
