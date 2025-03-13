import typia from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { IGoogleOAuth } from "@wrtnlabs/os-api/lib/structures/external/IGoogleOAuth";
import { IOAuth } from "@wrtnlabs/os-api/lib/structures/external/IOAuth";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";

import { HubGlobal } from "../../../../HubGlobal";
import { createQueryParameter } from "../../../../utils/CreateQueryParameter";
import { ErrorProvider } from "../../../common/ErrorProvider";

export namespace HubGoogleOAuthProvider {
  const client_id = HubGlobal.env.GOOGLE_OAUTH_CLIENT_ID;

  /**
   * Get Authentication URL from Google.
   *
   * @param input scope and redirect url
   * @returns Authentication URL.
   */
  export const getAuthUrl = async (
    input: IHubExternalUser.IGetAuthUrlInput,
  ): Promise<IHubExternalUser.IGetAuthUrlOutput> => {
    const query: IGoogleOAuth.IQuery.IAuth = {
      client_id,
      redirect_uri: input.redirect_uri,
      response_type: "code",
      scope: input.scope ?? "openid profile email",
      // access_type and prompt is needed for Refresh token.
      access_type: "offline",
      prompt: "consent",
      state: v4(),
    };

    const queryParam = createQueryParameter(query);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${encodeURI(queryParam)}`;

    return {
      auth_url: authUrl,
    };
  };

  /**
   * Google OAuth Login.
   *
   * @param input authorization code and redirect url
   * @returns Information of Token.
   */
  export const login = async (
    input: IHubExternalUser.IOAuthLoginInput,
  ): Promise<IOAuth.IToken> => {
    const response = await fetch(`https://oauth2.googleapis.com/token`, {
      method: "POST",
      body: JSON.stringify({
        client_id,
        client_secret: HubGlobal.env.GOOGLE_OAUTH_CLIENT_SECRET,
        code: input.authorization_code,
        grant_type: "authorization_code",
        redirect_uri: input.redirect_uri,
      } satisfies IGoogleOAuth.IQuery.IToken),
    });

    const tokenInfo = await response.json();

    if (!response.ok) {
      throw ErrorProvider.badRequest({
        code: CommonErrorCode.GOOGLE_API_ERROR,
        message: `Google API Error: ${JSON.stringify(tokenInfo)}`,
      });
    }

    // expired_at is seconds.
    const validTokenInfo = typia.assert<IGoogleOAuth.IToken>(tokenInfo);

    return {
      access: validTokenInfo.access_token,
      expired_at: new Date(
        Date.now() + validTokenInfo.expires_in * 1000,
      ).toISOString(),
      refresh: validTokenInfo.refresh_token,
      refreshable_until: null,
    };
  };

  /**
   * Get User Information using Access token from Google.
   *
   * @param props access token
   * @returns User Information
   */
  export const getUserInfo = async (props: {
    accessToken: string;
  }): Promise<IOAuth.IUser> => {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${props.accessToken}`,
        },
      },
    );

    const userInfo = await response.json();

    if (!response.ok) {
      throw ErrorProvider.badRequest({
        code: CommonErrorCode.GOOGLE_API_ERROR,
        message: `Google API Error: ${JSON.stringify(userInfo)}`,
      });
    }

    const validUserInfo = typia.assert<IGoogleOAuth.IUser>(userInfo);

    // use the front part of @(at) in email to name or nickname.
    const beforeAt = validUserInfo.email.split("@").at(0) ?? "no-name";

    return {
      uid: validUserInfo.sub,
      email: validUserInfo.email,
      nickname: beforeAt,
      name: validUserInfo.name ?? beforeAt,
    };
  };
}
