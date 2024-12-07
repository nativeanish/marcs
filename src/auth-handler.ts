import express from "express";
import { googleProvider } from "./provider/google";
import { microsoftProvider } from "./provider/microsoft";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  exchangeToken,
} from "./utils";

const router = express.Router();

const providers = {
  google: googleProvider,
  microsoft: microsoftProvider,
};

const activeCodeVerifiers: Record<string, string> = {};

router.get("/:provider/login", (req, res) => {
  const { provider: providerId } = req.params;
  //@ts-ignore
  const provider = providers[providerId];

  if (!provider) {
    return res.status(400).json({ error: "Unsupported provider" });
  }

  const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/${
    provider.id
  }/callback`;

  const queryParams: Record<string, string> = {
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: provider.scope,
    ...provider.customParams,
  };

  if (provider.supportsPKCE) {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    activeCodeVerifiers[providerId] = codeVerifier;
    queryParams.code_challenge = codeChallenge;
    queryParams.code_challenge_method = "S256";
  }

  const authorizationUrl = `${provider.authorizationUrl}?${new URLSearchParams(
    queryParams
  )}`;
  res.redirect(authorizationUrl);
});

router.get("/:provider/callback", async (req, res) => {
  const { provider: providerId } = req.params;
  //@ts-ignore
  const provider = providers[providerId];

  if (!provider) {
    return res.status(400).json({ error: "Unsupported provider" });
  }

  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

  const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/${
    provider.id
  }/callback`;

  const tokenData = await exchangeToken(
    provider,
    code as string,
    redirectUri,
    activeCodeVerifiers[providerId]
  );

  res.json(tokenData);
});

export default router;
