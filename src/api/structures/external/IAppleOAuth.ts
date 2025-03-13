import { tags } from "typia";

/**
 * Namespace about Apple OAuth
 *
 * This is used for Type of apple api.
 */
export namespace IAppleOAuth {
  /**
   * Query string request information.
   */
  export namespace IQuery {
    /**
     * Apple auth request.
     */
    export interface IAuth {
      /**
       * Client id
       *
       * This is used to identify the apple application.
       */
      client_id: string;

      /**
       * Redirect URI.
       */
      redirect_uri: string;

      /**
       * Response Type of Apple auth request.
       */
      response_type: "code";

      /**
       * Scope for Access Permission.
       */
      scope: string;

      /**
       * The type of response mode expected.
       *
       * "query" | "fragment" | "form_post"
       * but, we only use "form_post" to get email and name.
       */
      response_mode?: "form_post";

      /**
       * String that you random generate.
       *
       * Values used to prevent CSRF attacks and manage client state.
       */
      state?: string;

      /**
       * A unique, single-use string that your app provides to associate a client session with the user’s identity token.
       *
       * This value also prevents replay attacks, and correlates the initial authentication request to the identity token provided in the authorization response.
       */
      nonce?: string;
    }
  }

  /**
   * Apple Token Information.
   */
  export interface IToken {
    /**
     * Access Token.
     */
    access_token: string;

    /**
     * Type of Token.
     *
     * Always has value of "Bearer"
     *
     * @default Bearer
     */
    token_type: string;

    /**
     * Time remaining until expiration(seconds).
     */
    expires_in: number;

    /**
     * Refresh Token.
     */
    refresh_token: string;

    /**
     * A JWT that contains the user’s identity information.
     */
    id_token: string;
  }

  /**
   * The Information in the parsed token.
   */
  export interface IParsedToken {
    /**
     * @title User unique id.
     */
    sub: string;

    /**
     * Email of User.
     */
    email: string & tags.Format<"email">;

    /**
     * Whether the User Email is verified.
     */
    email_verified?: boolean;
  }
}
