import { tags } from "typia";

/**
 * Namespace about Google OAuth
 *
 * This is used for Type of google api.
 */
export namespace IGoogleOAuth {
  /**
   * Query string request information.
   */
  export namespace IQuery {
    /**
     * Query of Google Authentication URL.
     */
    export interface IAuth {
      /**
       * Client id
       *
       * This is used to identify the google application.
       */
      client_id: string;

      /**
       * Redirect URI.
       */
      redirect_uri: string;

      /**
       * Response Type of Google auth request.
       */
      response_type: "code";

      /**
       * Scope for Access Permission.
       */
      scope: string;

      /**
       * Access Type.
       *
       * This display that If user exit a browser, user can refresh the access token. (offline)
       * Valid value is "offline" | "online"
       *
       * @default online
       */
      access_type?: string;

      /**
       * String that you random generate.
       *
       * Values used to prevent CSRF attacks and manage client state.
       */
      state?: string;

      /**
       * Option for more flexibility in handling requests for additional permissions in OAuth authorization requests.
       *
       * Setting this allows you to request new permissions while maintaining permissions already granted to the user.
       */
      include_granted_scopes?: string;

      /**
       * Options for giving users granular permission choices.
       *
       * Not required for users after 2019.
       */
      enable_granular_consent?: string;

      /**
       * Login Hint.
       */
      login_hint?: string;

      /**
       * List of prompts to display to users.
       *
       * Valid value is "none" | "consent" | "select_account"
       */
      prompt?: string;
    }

    /**
     * Information to get Token.
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
   * Google Token Information.
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
     * Always has value of "Bearer"
     *
     * @default Bearer
     */
    token_type: string;

    /**
     * Access Permission range.
     */
    scope: string;

    /**
     * Refresh Token.
     */
    refresh_token: string;
  }

  /**
   * Google User Information.
   */
  export interface IUser {
    /**
     * @title User unique id.
     */
    sub: string;

    /**
     * Email of User.
     */
    email: string & tags.Format<"email">;

    /**
     * Name of User.
     */
    name?: string;

    /**
     * First name.
     */
    given_name?: string;

    /**
     * Last name.
     */
    family_name?: string;

    /**
     * User Profile URL.
     */
    picture?: string;

    /**
     * Whether the User Email is verified.
     */
    email_verified?: boolean;

    /**
     * Locale.
     */
    locale?: string;
  }
}
