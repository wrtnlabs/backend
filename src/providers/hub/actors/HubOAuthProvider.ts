import { RandomGenerator } from "@nestia/e2e";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IOAuth } from "@wrtnlabs/os-api/lib/structures/external/IOAuth";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";

import { HubGlobal } from "../../../HubGlobal";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubExternalUserProvider } from "./HubExternalUserProvider";
import { HubMemberProvider } from "./HubMemberProvider";
import { HubAppleOAuthProvider } from "./oauth/HubAppleOAuthProvider";
import { HubGoogleOAuthProvider } from "./oauth/HubGoogleOAuthProvider";
import { HubKakaoOAuthProvider } from "./oauth/HubKakaoOAuthProvider";
import { HubNaverOAuthProvider } from "./oauth/HubNaverOAuthProvider";

export namespace HubOAuthProvider {
  /**
   * OAauth login.
   *
   * @param application OAuth provider
   * @returns Customer with Member
   */
  export const login =
    (application: IHubExternalUser.IApplicationParam) =>
    async (props: {
      input: IHubExternalUser.IOAuthLoginInput;
      customer: IHubCustomer;
    }): Promise<IHubCustomer.IOAuthLogin> => {
      let tokenInfo: IOAuth.IToken;

      // Get Token Information from OAuth Provider.
      if (application === "google") {
        tokenInfo = await HubGoogleOAuthProvider.login(props.input);
      } else if (application === "kakao") {
        tokenInfo = await HubKakaoOAuthProvider.login(props.input);
      } else if (application === "naver") {
        tokenInfo = await HubNaverOAuthProvider.login(props.input);
      } else if (application === "apple") {
        tokenInfo = await HubAppleOAuthProvider.login(props.input);
      } else {
        throw new Error();
      }

      // Get User Info for save Database
      const userInfo =
        await HubOAuthProvider.getUserInfo(application)(tokenInfo);

      // If userInfo don't have a nickname, use the id part of the email as the nickname.
      const externalUser = await HubExternalUserProvider.emplace({
        channel: { id: props.customer.channel.id },
        customer: props.customer,
        input: {
          application,
          citizen: null,
          content: {
            birthYear: null,
            gender: "none",
            interests: null,
            jobs: [],
            provider: application,
            purposes: null,
          },
          data: null,
          nickname: userInfo.nickname ?? userInfo.email.split("@")[0],
          password: userInfo.email,
          uid: userInfo.uid,
        },
      });

      // if member id is null, create member
      if (!externalUser.member_id) {
        /**
         * Get random alphanumeric string for nickname.
         */
        const getAlphaNumeric = (nicknames: string[]) => {
          // 1.extract postfix
          const postfixes = nicknames
            .map((nickname) => {
              const split = nickname.split(userInfo.nickname);

              return split[1];
            })
            .filter((el) => el.length === 4);

          // 2. use random alphaNumeric Random Generator, make new nickname.
          let alphaNumeric = RandomGenerator.alphaNumeric(4);

          // 3. check that new nickname is unique.
          while (postfixes.includes(alphaNumeric)) {
            alphaNumeric = RandomGenerator.alphaNumeric(4);
          }

          return alphaNumeric;
        };

        // process duplicated nickname.
        const members = await HubGlobal.prisma.hub_members.findMany({
          select: {
            id: true,
            nickname: true,
          },
          where: {
            nickname: {
              startsWith: userInfo.nickname,
            },
          },
        });

        const nicknames = members.map((member) => member.nickname);

        const customer = await HubMemberProvider.join({
          customer: { ...props.customer, external_user: externalUser },
          input: {
            citizen: null,
            email: userInfo.email,
            nickname:
              members.length === 0
                ? userInfo.nickname
                : `${userInfo.nickname}${getAlphaNumeric(nicknames)}`,
            password: null,
          },
        });

        if (!customer.external_user) {
          throw ErrorProvider.notFound({
            accessor: "customer.external_user",
            code: HubActorErrorCode.EXTERNAL_USER_NOT_FOUND,
            message: "External User is not created.",
          });
        }

        if (!customer.member) {
          throw ErrorProvider.notFound({
            accessor: "customer.member",
            code: HubActorErrorCode.NOT_MEMBER,
            message: "Member is not created.",
          });
        }

        return {
          ...customer,
          external_user: customer.external_user,
          member: customer.member,
        };
      }

      // if member already exists (member id exists), find member.
      const record = await HubGlobal.prisma.hub_members.findFirstOrThrow({
        where: {
          id: externalUser.member_id,
        },
        ...HubMemberProvider.json.select(),
      });

      return {
        ...props.customer,
        external_user: externalUser,
        member: HubMemberProvider.json.transform(record),
      };
    };

  /**
   * Get Authentication URL.
   *
   * @param application OAuth provider
   * @returns Authentication Url
   */
  export const getAuthUrl =
    (application: IHubExternalUser.IApplicationParam) =>
    async (
      input: IHubExternalUser.IGetAuthUrlInput,
    ): Promise<IHubExternalUser.IGetAuthUrlOutput> => {
      if (application === "google") {
        return await HubGoogleOAuthProvider.getAuthUrl(input);
      } else if (application === "kakao") {
        return await HubKakaoOAuthProvider.getAuthUrl(input);
      } else if (application === "naver") {
        return await HubNaverOAuthProvider.getAuthUrl(input);
      } else if (application === "apple") {
        return await HubAppleOAuthProvider.getAuthUrl(input);
      } else {
        throw new Error();
      }
    };

  /**
   * Get User Information from OAuth provider
   *
   * @param application OAuth Provider
   * @returns User info from OAuth provider
   */
  export const getUserInfo =
    (application: IHubExternalUser.IApplicationParam) =>
    async (props: IOAuth.IToken) => {
      if (application === "google") {
        return await HubGoogleOAuthProvider.getUserInfo({
          accessToken: props.access,
        });
      } else if (application === "kakao") {
        return await HubKakaoOAuthProvider.getUserInfo({
          accessToken: props.access,
        });
      } else if (application === "naver") {
        return await HubNaverOAuthProvider.getUserInfo({
          accessToken: props.access,
        });
      } else if (application === "apple") {
        if (!props.id_token) {
          throw ErrorProvider.notFound({
            accessor: "tokenInfo.id_token",
            code: CommonErrorCode.APPLE_API_ERROR,
            message: "Apple API Error: ID Token is not found.",
          });
        }

        return await HubAppleOAuthProvider.getUserInfo({
          idToken: props.id_token,
        });
      } else {
        throw new Error();
      }
    };
}
