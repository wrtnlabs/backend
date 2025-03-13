import typia from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { INaverOAuth } from "@wrtnlabs/os-api/lib/structures/external/INaverOAuth";
import { IOAuth } from "@wrtnlabs/os-api/lib/structures/external/IOAuth";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";

import { HubGlobal } from "../../../../HubGlobal";
import { createQueryParameter } from "../../../../utils/CreateQueryParameter";
import { ErrorProvider } from "../../../common/ErrorProvider";

export namespace HubNaverOAuthProvider {
  const client_id = HubGlobal.env.NAVER_OAUTH_CLIENT_ID;

  /**
   * Get Authentication URL from Naver.
   *
   * @param input scope and redirect url
   * @returns Authentication URL.
   */
  export const getAuthUrl = async (
    input: IHubExternalUser.IGetAuthUrlInput,
  ): Promise<IHubExternalUser.IGetAuthUrlOutput> => {
    const query: INaverOAuth.IQuery.IAuth = {
      client_id,
      redirect_uri: input.redirect_uri,
      response_type: "code",
      state: v4(),
      ...(input.scope ? { scope: input.scope } : {}),
    };

    const queryParam = createQueryParameter(query);

    const authUrl = `https://nid.naver.com/oauth2.0/authorize?${encodeURI(queryParam)}`;

    return {
      auth_url: authUrl,
    };
  };

  /**
   * Naver OAuth Login.
   *
   * @param input authorization code and redirect url
   * @returns Information of Token.
   */
  export const login = async (
    input: IHubExternalUser.IOAuthLoginInput,
  ): Promise<IOAuth.IToken> => {
    const query: INaverOAuth.IQuery.IToken = {
      client_id,
      client_secret: HubGlobal.env.NAVER_OAUTH_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: input.authorization_code,
      state: v4(),
    };

    const queryParam = createQueryParameter(query);

    const response = await fetch(
      `https://nid.naver.com/oauth2.0/token?${encodeURI(queryParam)}`,
      {
        method: "POST",
      },
    );

    const tokenInfo = await response.json();

    if (tokenInfo.error) {
      throw ErrorProvider.badRequest({
        code: CommonErrorCode.NAVER_API_ERROR,
        message: `Naver API Error: ${JSON.stringify(tokenInfo)}`,
      });
    }

    const validTokenInfo = typia.assert<INaverOAuth.IToken>(tokenInfo);

    return {
      access: validTokenInfo.access_token,
      expired_at: new Date(
        Date.now() + Number(validTokenInfo.expires_in) * 1000,
      ).toISOString(),
      refresh: validTokenInfo.refresh_token,
      refreshable_until: null,
    };
  };

  /**
   * Get User Information using Access token from Naver.
   *
   * @param props access token
   * @returns User Information
   */
  export const getUserInfo = async (props: {
    accessToken: string;
  }): Promise<IOAuth.IUser> => {
    const response = await fetch(`https://openapi.naver.com/v1/nid/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${props.accessToken}`,
      },
    });

    const userInfo = await response.json();

    if (userInfo.message !== "success") {
      throw ErrorProvider.badRequest({
        code: CommonErrorCode.NAVER_API_ERROR,
        message: `Naver API Error: ${JSON.stringify(userInfo)}`,
      });
    }

    const validUserInfo = typia.assert<INaverOAuth.IUser>(userInfo);

    if (!validUserInfo.response.email) {
      throw ErrorProvider.badRequest({
        code: CommonErrorCode.NAVER_API_ERROR,
        message: `You don't have an email in your Naver Account`,
      });
    }

    // use the front part of @(at) in email to name or nickname.
    const beforeAt = validUserInfo.response.email.split("@")[0];

    return {
      email: validUserInfo.response.email,
      name: validUserInfo.response.name ?? beforeAt,
      nickname:
        validUserInfo.response.nickname ??
        validUserInfo.response.email.split("@").at(0) ??
        "no-name",
      uid: validUserInfo.response.id,
    };
  };
}
