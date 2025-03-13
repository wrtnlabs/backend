import jwt from "jsonwebtoken";
import typia from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { IAppleOAuth } from "@wrtnlabs/os-api/lib/structures/external/IAppleOAuth";
import { IOAuth } from "@wrtnlabs/os-api/lib/structures/external/IOAuth";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";

import { HubGlobal } from "../../../../HubGlobal";
import { createQueryParameter } from "../../../../utils/CreateQueryParameter";
import { ErrorProvider } from "../../../common/ErrorProvider";

export namespace HubAppleOAuthProvider {
  const getClientSecret = (() => {
    let client_secret: string | null = null;

    const generateClientSecret = () => {
      const privateKey = HubGlobal.env.APPLE_OAUTH_PRIVATE_KEY;

      // JWT 서명 생성
      const token = jwt.sign(
        {
          iss: HubGlobal.env.APPLE_OAUTH_TEAM_ID, // Team ID
          iat: Math.floor(Date.now() / 1000), // Current Unix timestamp
          exp: Math.floor(Date.now() / 1000) + EXPIRES_IN, // Expiration time (6 months from now)
          aud: "https://appleid.apple.com",
          sub: HubGlobal.env.APPLE_OAUTH_CLIENT_ID, // Your App ID or Services ID
        },
        privateKey,
        {
          algorithm: HubGlobal.env.APPLE_OAUTH_ALGORITHM as any,
          keyid: HubGlobal.env.APPLE_OAUTH_KEY_ID, // apple developer's key id
        },
      );

      return token;
    };

    return () => {
      if (!client_secret) {
        client_secret = generateClientSecret();
        return client_secret;
      }

      try {
        const BUFFER_TIME = 60 * 60; // 1 hour (unit is second)
        const decoded = jwt.decode(client_secret);

        if (typeof decoded === "string" || !decoded || !decoded.exp) {
          client_secret = generateClientSecret();
          return client_secret;
        }

        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp <= now + BUFFER_TIME) {
          client_secret = generateClientSecret();
          return client_secret;
        }

        return client_secret;
      } catch (err) {
        // If there is a problem, consider it as expiration.
        client_secret = generateClientSecret();
        return client_secret;
      }
    };
  })();

  /**
   * Get Authentication URL from Apple.
   *
   * @param input scope and redirect url
   * @returns Authentication URL.
   */
  export const getAuthUrl = async (
    input: IHubExternalUser.IGetAuthUrlInput,
  ): Promise<IHubExternalUser.IGetAuthUrlOutput> => {
    const query: IAppleOAuth.IQuery.IAuth = {
      client_id: HubGlobal.env.APPLE_OAUTH_CLIENT_ID,
      redirect_uri: input.redirect_uri,
      response_type: "code",
      scope: input.scope ?? "name email",
      response_mode: "form_post",
      state: v4(),
    };

    const queryParam = createQueryParameter(query);

    const authUrl = `https://appleid.apple.com/auth/authorize?${encodeURI(queryParam)}`;

    return {
      auth_url: authUrl,
    };
  };

  /**
   * Apple OAuth Login.
   *
   * @param input authorization code and redirect url
   * @returns Information of Token.
   */
  export const login = async (
    input: IHubExternalUser.IOAuthLoginInput,
  ): Promise<IOAuth.IToken> => {
    // Validation client secret
    const client_secret = getClientSecret();

    const response = await fetch(`https://appleid.apple.com/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: HubGlobal.env.APPLE_OAUTH_CLIENT_ID,
        client_secret: client_secret,
        code: input.authorization_code,
        grant_type: "authorization_code",
        redirect_uri: input.redirect_uri,
      }).toString(),
    });

    const tokenInfo = await response.json();

    if (!response.ok) {
      throw ErrorProvider.badRequest({
        code: CommonErrorCode.APPLE_API_ERROR,
        message: `Apple API Error: ${JSON.stringify(tokenInfo)}`,
      });
    }

    const validTokenInfo = typia.assert<IAppleOAuth.IToken>(tokenInfo);

    return {
      access: validTokenInfo.id_token,
      expired_at: new Date(
        Date.now() + validTokenInfo.expires_in * 1000,
      ).toISOString(),
      refresh: validTokenInfo.refresh_token,
      refreshable_until: null,
      id_token: validTokenInfo.id_token,
    };
  };

  /**
   * Get User Information using Access token from Apple.
   *
   * @param props access token
   * @returns User Information
   */
  export const getUserInfo = async (props: {
    idToken: string;
  }): Promise<IOAuth.IUser> => {
    const decoded = jwt.decode(props.idToken, {
      complete: true,
    });

    if (!decoded) {
      throw ErrorProvider.internal({
        code: CommonErrorCode.INVALID_JWT,
        message: `Fail to parse Apple Token.`,
      });
    }

    const validTokenInfo: IAppleOAuth.IParsedToken = decoded.payload as any;

    // use the front part of @(at) in email to name or nickname.
    const beforeAt = validTokenInfo.email.split("@").at(0) ?? "no-name";

    return {
      uid: validTokenInfo.sub,
      email: validTokenInfo.email,
      name: beforeAt,
      nickname: beforeAt,
    };
  };
}

// Expire time. second / minutes / hours / days / weeks / 24 weeks = 6 month
const EXPIRES_IN = 60 * 60 * 24 * 7 * 24;
