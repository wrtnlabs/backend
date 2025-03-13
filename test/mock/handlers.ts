import jwt from "jsonwebtoken";
import { HttpResponse, http } from "msw";
import typia, { tags } from "typia";

import { IAppleOAuth } from "@wrtnlabs/os-api/lib/structures/external/IAppleOAuth";
import { IGoogleOAuth } from "@wrtnlabs/os-api/lib/structures/external/IGoogleOAuth";
import { IKakaoOAuth } from "@wrtnlabs/os-api/lib/structures/external/IKakaoOAuth";
import { INaverOAuth } from "@wrtnlabs/os-api/lib/structures/external/INaverOAuth";

const authorizationCodeMap = new Map<string, string>();
const tokenStorage = new Map<string, string>();

const issueAuthorizationCode = (email: string) => {
  const code = typia.random<string>();
  authorizationCodeMap.set(code, email);
  return code;
};

const issueJwtToken = (email: string) => {
  const token = jwt.sign({ email }, typia.random<string>());
  tokenStorage.set(token, email);
  return token;
};

const token = [
  http.get("https://give_me_the_authorization_code/", ({ request }) => {
    const email = request.headers.get("email");
    if (!email) {
      throw new Error("append `email` on request header");
    }

    const code = issueAuthorizationCode(email);
    return HttpResponse.json({
      code,
    });
  }),
];

const googleOAuth = [
  http.post("https://oauth2.googleapis.com/token", async ({ request }) => {
    const body = (await request.json()) as any;
    const code = body.code;
    const email = authorizationCodeMap.get(code);
    if (!email) {
      throw new Error("Set authorizationCodeMap");
    }

    return HttpResponse.json({
      ...typia.random<IGoogleOAuth.IToken>(),
      access_token: issueJwtToken(email),
    } satisfies IGoogleOAuth.IToken);
  }),

  http.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    async ({ request }) => {
      const accessToken = request.headers
        .get("Authorization")
        ?.split(" ")
        .at(1);

      if (!accessToken) {
        throw new Error("Set tokenStorage");
      }

      const email = tokenStorage.get(accessToken);

      return HttpResponse.json({
        ...typia.random<IGoogleOAuth.IUser>(),
        email: email ?? typia.random<tags.Format<"email"> & string>(),
      } satisfies IGoogleOAuth.IUser);
    },
  ),
];

const naverOAuth = [
  http.post("https://nid.naver.com/oauth2.0/token", async ({ request }) => {
    const query = new URLSearchParams(request.url.split("?").slice(-1).at(0));

    const code = query.get("code") as any;
    const email = authorizationCodeMap.get(code);

    if (!email) {
      throw new Error("Set authorizationCodeMap");
    }

    return HttpResponse.json({
      ...typia.random<INaverOAuth.IToken>(),
      access_token: issueJwtToken(email),
    } satisfies INaverOAuth.IToken);
  }),

  http.get("https://openapi.naver.com/v1/nid/me", async ({ request }) => {
    const response = typia.random<INaverOAuth.IUser>();

    const accessToken = request.headers.get("Authorization")?.split(" ").at(1);

    if (!accessToken) {
      throw new Error("Set tokenStorage");
    }

    const email = tokenStorage.get(accessToken);

    return HttpResponse.json({
      ...response,
      response: {
        ...response.response,
        email: email ?? response.response.email,
      },
      message: "success",
    } satisfies INaverOAuth.IUser);
  }),
];

const kakaoOAuth = [
  http.post("https://kauth.kakao.com/oauth/token", async ({ request }) => {
    const query = new URLSearchParams(request.url.split("?").slice(-1).at(0));

    const code = query.get("code") as any;
    const email = authorizationCodeMap.get(code);

    if (!email) {
      throw new Error("Set authorizationCodeMap");
    }

    return HttpResponse.json({
      ...typia.random<IKakaoOAuth.IToken>(),
      access_token: issueJwtToken(email),
    } satisfies IKakaoOAuth.IToken);
  }),

  http.get("https://kapi.kakao.com/v2/user/me", async ({ request }) => {
    const response = typia.random<IKakaoOAuth.IUser>();

    const accessToken = request.headers.get("Authorization")?.split(" ").at(1);

    if (!accessToken) {
      throw new Error("Set tokenStorage");
    }

    const email = tokenStorage.get(accessToken);

    return HttpResponse.json({
      ...response,
      kakao_account: {
        ...response.kakao_account,
        profile: {
          ...response.kakao_account?.profile,
          nickname: `michael`,
        },
        email: email ?? typia.random<tags.Format<"email"> & string>(),
      },
    } satisfies IKakaoOAuth.IUser);
  }),
];

const appleOAuth = [
  http.post("https://appleid.apple.com/auth/token", async ({ request }) => {
    const body = (await request.text()) as any;
    const params = new URLSearchParams(body);
    const code = params.get("code") as any;
    const email = authorizationCodeMap.get(code);
    if (!email) {
      throw new Error("Set authorizationCodeMap");
    }

    const id_token = jwt.sign(
      {
        ...typia.random<IAppleOAuth.IParsedToken>(),
        email: email ?? typia.random<string & tags.Format<"email">>(),
      } satisfies IAppleOAuth.IParsedToken,
      "secret",
    );

    return HttpResponse.json({
      ...(typia.random<IAppleOAuth.IToken>() satisfies IAppleOAuth.IToken),
      id_token,
    } satisfies IAppleOAuth.IToken);
  }),
];

export const handlers = [
  ...token,
  ...googleOAuth,
  ...naverOAuth,
  ...kakaoOAuth,
  ...appleOAuth,
];
