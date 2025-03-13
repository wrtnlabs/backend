import { tags } from "typia";

/**
 * Namespace about Kakao OAuth
 *
 * This is used for Type of kakao api.
 */
export namespace IKakaoOAuth {
  /**
   * Query string request information.
   */
  export namespace IQuery {
    /**
     * Query of Kakao Authentication URL.
     */
    export interface IAuth {
      /**
       * Client id
       *
       * This is used to identify the kakao application.
       */
      client_id: string;

      /**
       * Redirect URI.
       */
      redirect_uri: string;

      /**
       * Response Type of Kakao auth request.
       *
       * @default code
       */
      response_type: "code";

      /**
       * Scope for Access Permission.
       *
       * Separator is ","
       */
      scope?: string;

      /**
       * List of prompts to display to users.
       *
       * Valid value is "none" | "login" | "create" | "select_account"
       */
      prompt?: string;

      /**
       * Login Hint.
       */
      login_hint?: string;

      /**
       * List of terms of service tags to be agreed to.
       */
      service_terms?: string;

      /**
       * String that you random generate.
       *
       * Values used to prevent CSRF attacks and manage client state.
       */
      state?: string;

      /**
       * Used to prevent ID token replay attacks.
       */
      nonce?: string;
    }

    /**
     * Information to get Token
     */
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
       * Authorization code.
       */
      code: string;

      /**
       * Grant Type.
       *
       * fixed value "authorization_code"
       */
      grant_type: "authorization_code";

      /**
       * Redirect URI.
       */
      redirect_uri: string;
    }
  }

  /**
   * Kakao Token Information.
   */
  export interface IToken {
    /**
     * Access Token.
     */
    access_token: string;

    /**
     * Time remaining until expiration(seconds).
     */
    expires_in: number;

    /**
     * Type of Token.
     *
     * Always has value of "bearer"
     *
     * @default bearer
     */
    token_type: string;

    /**
     * Refresh Token.
     */
    refresh_token: string;

    /**
     * Time remaining until expiration(seconds).
     */
    refresh_token_expires_in: number;

    /**
     * Access Permission range.
     */
    scope?: string;

    /**
     * Identity tokens issued through the OpenID Connect extension.
     */
    id_token?: string;
  }

  /**
   * Kakao User Information.
   */
  export interface IUser {
    /**
     * @title User unique id.
     *
     * Long Type.
     */
    id: number;

    /**
     * Whether the Connect call is complete.
     */
    has_signed_up?: string;

    /**
     * When the service was connected.
     */
    connected_at?: string & tags.Format<"date-time">;

    /**
     * When user logged in via KakaoSync Simple Signup.
     */
    synched_at?: string & tags.Format<"date-time">;

    /**
     * User Properties.
     */
    properties?: unknown;

    /**
     * Kakao account information.
     */
    kakao_account?: {
      /**
       * User Email.
       */
      email: string & tags.Format<"email">;

      /**
       * User Name.
       */
      name?: string;

      /**
       * Birth Year.
       */
      birthYear?: string;

      /**
       * Birth Day.
       */
      birthDay?: string;

      /**
       * Gender.
       */
      gender?: "female" | "male";

      /**
       * Phone Number.
       */
      phone_number?: string;

      profile?: {
        /**
         * User Nickname.
         */
        nickname?: string;

        /**
         * Profile Image URL.
         */
        thumbnail_image_url?: string;
      };
    };

    /**
     * additional information.
     */
    for_partner?: any;
  }
}
