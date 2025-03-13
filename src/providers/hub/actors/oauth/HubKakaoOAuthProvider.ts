import typia from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { IKakaoOAuth } from "@wrtnlabs/os-api/lib/structures/external/IKakaoOAuth";
import { IOAuth } from "@wrtnlabs/os-api/lib/structures/external/IOAuth";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";

import { HubGlobal } from "../../../../HubGlobal";
import { createQueryParameter } from "../../../../utils/CreateQueryParameter";
import { ErrorProvider } from "../../../common/ErrorProvider";

export namespace HubKakaoOAuthProvider {
  const client_id = HubGlobal.env.KAKAO_OAUTH_CLIENT_ID;

  /**
   * Get Authentication URL from Kakao.
   *
   * @param input scope and redirect url
   * @returns Authentication URL.
   */
  export const getAuthUrl = async (
    input: IHubExternalUser.IGetAuthUrlInput,
  ): Promise<IHubExternalUser.IGetAuthUrlOutput> => {
    const query: IKakaoOAuth.IQuery.IAuth = {
      client_id,
      redirect_uri: input.redirect_uri,
      response_type: "code",
      ...(input.scope ? { scope: input.scope } : {}),
      state: v4(),
    };

    const queryParam = createQueryParameter(query);

    const authUrl = `https://kauth.kakao.com/oauth/authorize?${encodeURI(queryParam)}`;

    return {
      auth_url: authUrl,
    };
  };

  /**
   * Kakao OAuth Login.
   *
   * @param input authorization code and redirect url
   * @returns Information of Token.
   */
  export const login = async (
    input: IHubExternalUser.IOAuthLoginInput,
  ): Promise<IOAuth.IToken> => {
    const query: IKakaoOAuth.IQuery.IToken = {
      client_id,
      client_secret: HubGlobal.env.KAKAO_OAUTH_CLIENT_SECRET,
      code: input.authorization_code,
      grant_type: "authorization_code",
      redirect_uri: input.redirect_uri,
    };

    const queryParam = createQueryParameter(query);

    const response = await fetch(
      `https://kauth.kakao.com/oauth/token?${encodeURI(queryParam)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      },
    );

    const tokenInfo = await response.json();

    if (!response.ok) {
      throw ErrorProvider.badRequest({
        code: CommonErrorCode.KAKAO_API_ERROR,
        message: `Kakao API Error: ${JSON.stringify(tokenInfo)}`,
      });
    }

    // expired_at is seconds.
    const validTokenInfo = typia.assert<IKakaoOAuth.IToken>(tokenInfo);

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
   * Get User Information using Access token from Kakao.
   *
   * @param props access token
   * @returns User Information
   */
  export const getUserInfo = async (props: {
    accessToken: string;
  }): Promise<IOAuth.IUser> => {
    const query = {
      secure_resource: true,
    };

    const queryParam = createQueryParameter(query);

    const response = await fetch(
      `https://kapi.kakao.com/v2/user/me?${encodeURI(queryParam)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${props.accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      },
    );

    const userInfo = await response.json();

    if (!response.ok) {
      throw ErrorProvider.badRequest({
        code: CommonErrorCode.KAKAO_API_ERROR,
        message: `Kakao API Error: ${JSON.stringify(userInfo)}`,
      });
    }

    const validUserInfo = typia.assert<IKakaoOAuth.IUser>(userInfo);

    if (!validUserInfo.kakao_account?.email) {
      throw ErrorProvider.badRequest({
        code: CommonErrorCode.KAKAO_API_ERROR,
        message: `You don't have an email in your Kakao Account`,
      });
    }

    // use the front part of @(at) in email to name or nickname.
    const beforeAt =
      validUserInfo.kakao_account.email.split("@").at(0) ?? "no-name";

    return {
      uid: validUserInfo.id.toString(),
      email: validUserInfo.kakao_account.email,
      nickname: validUserInfo.kakao_account.profile?.nickname ?? beforeAt,
      name: validUserInfo.kakao_account.name ?? beforeAt,
    };
  };
}
