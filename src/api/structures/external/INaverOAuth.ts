import { tags } from "typia";

/**
 * Namespace about Naver OAuth
 *
 * This is used for Type of naver api.
 */
export namespace INaverOAuth {
  /**
   * Query string request information.
   */
  export namespace IQuery {
    /**
     * Query of Naver Authentication URL.
     */
    export interface IAuth {
      /**
       * Client id
       *
       * This is used to identify the naver application.
       */
      client_id: string;

      /**
       * Redirect URI.
       */
      redirect_uri: string;

      /**
       * Response Type of Naver auth request.
       */
      response_type: "code";

      /**
       * String that you random generate.
       *
       * Values used to prevent CSRF attacks and manage client state.
       */
      state: string;

      /**
       * Access Permission range.
       */
      scope?: string;
    }

    export interface IToken {
      /**
       * Client ID.
       */
      client_id: string;

      /**
       * Client Secret.
       */
      client_secret: string;

      /**
       * Grant Type.
       *
       * fixed value "authorization_code"
       */
      grant_type: "authorization_code";

      /**
       * Authorization Code.
       */
      code: string;

      /**
       * String that you random generate.
       *
       * Values used to prevent CSRF attacks and manage client state.
       */
      state: string;
    }
  }

  export interface IToken {
    /**
     * Access Token.
     */
    access_token: string;

    /**
     * Refresh Token.
     */
    refresh_token: string;

    /**
     * Type of Token.
     *
     * "Bearer" or "MAC"
     *
     * @default Bearer
     */
    token_type: string;

    /**
     * Time remaining until expiration(seconds).
     */
    expires_in: `${number}`;
  }

  /**
   * Naver User Information.
   */
  export interface IUser {
    /**
     * Status Code.
     */
    resultcode: string;

    /**
     * Result Message.
     */
    message: string;

    /**
     * Response Data.
     */
    response: {
      /**
       * @title User unique id.
       */
      id: string;

      /**
       * User Email.
       */
      email: string & tags.Format<"email">;

      /**
       * User Nickname.
       */
      nickname?: string;

      /**
       * User Name.
       */
      name?: string;

      /**
       * User Gender.
       *
       * F is femail.
       * M is male.
       * U is unidentifiable.
       */
      gender?: "F" | "M" | "U";

      /**
       * User Age.
       */
      age?: string;

      /**
       * User BirthYear.
       */
      birthyear?: string;

      /**
       * User Birthday.
       *
       * @format MM-DD
       */
      birthday?: string;

      /**
       * User Profile Image.
       */
      profile_image?: string;

      /**
       * User Phone Number.
       */
      mobile?: string;
    };
  }
}
