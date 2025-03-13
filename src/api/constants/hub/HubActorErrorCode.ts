/**
 * Here is a set of Actor partial error codes.
 *
 * @author Asher
 */
export const enum HubActorErrorCode {
  /**
   * Non-existent token.
   *
   * A bug that occurs when an API requires customer or member authentication, etc., but the {@link IConnection.headers.authorization} value does not exist in the request information.
   */
  TOKEN_NOT_FOUND = "HUB_ACTOR_AUTHENTICATION_TOKEN_NOT_FOUND",

  /**
   * Invalid token.
   *
   * A bug that occurs when an API requires customer or member authentication, but the {@link IConnection.headers.authorization} value in the request information is invalid.
   */
  INVALID_TOKEN = "HUB_ACTOR_INVALID_TOKEN",

  /**
   * Expired token.
   *
   * A bug that occurs when an API requires customer or member authentication, but the token contained in the request information {@link IConnection.headers.authorization} has already expired.
   */
  EXPIRED_TOKEN = "HUB_ACTR_EXPIRED_TOKEN",

  /**
   * Not a member.
   *
   * If the API requires member authentication, but the customer using it is not a member.
   */
  NOT_MEMBER = "HUB_ACTOR_NOT_JOINED_MEMBER",

  /**
   * Already registered administrator.
   * w
   * When calling the administrator membership registration API, but the person in question is already an administrator.
   */
  ALREADY_JOINED_ADMINISTRATOR = "HUB_ACTOR_ALREADY_JOINED_ADMINISTRATOR",

  /**
   * Not an administrator.
   *
   * The API requires administrator privileges, but the requester is not an administrator member.
   */
  NOT_ADMINISTRATOR = "HUB_ACTOR_NOT_ADMINISTRATOR",

  /**
   * Uncertified citizen.
   *
   * API that requires citizen authentication, but the customer does not.
   */
  NOT_CITIZEN = "HUB_ACTOR_NOT_CITIZEN",

  /**
   * Already registered member.
   *
   * The member registration API was called, but the customer is already registered.
   */
  ALREADY_JOINED_MEMBER = "HUB_ACTOR_ALREADY_JOINED_MEMBER",

  /**
   * Another citizen.
   *
   * When calling the citizen authentication API, a person who has already authenticated as a citizen attempts to re-authenticate with another citizen's information.
   */
  DIFFERENT_CITIZEN = "HUB_ACTOR_DIFFERENT_CITIZEN",

  /**
   * Already a registered seller
   */
  ALREADY_JOINED_SELLER = "HUB_ACTOR_ALREADY_JOINED_SELLER",

  /**
   * Non-registered seller
   */
  NOT_JOINED_SELLER = "HUB_ACTOR_NOT_JOINED_SELLER",

  /**
   * Password does not match
   */
  PASSWORD_NOT_MATCHED = "HUB_ACTOR_PASSWORD_NOT_MATCHED",

  /**
   * Existing nickname
   */
  DUPLICATED_NICKNAME = "HUB_ACTOR_EXIST_DUPLICATED_NICKNAME",

  /**
   * Existing email
   */
  DUPLICATED_EMAIL = "HUB_ACTOR_DUPLICATEDT_EMAIL",

  /**
   * Existing mobile number
   */
  DUPLICATED_MOBILE = "HUB_ACTOR_DUPLICATED_MOBILE",

  /**
   * Email not found
   */
  EMAIL_NOT_FOUND = "HUB_ACTOR_EMAIL_NOT_FOUND",

  /**
   * Incorrect external user password
   */
  EXTERNAL_USER_PASSWORD_INCORRECT = "HUB_ACTOR_EXTERNAL_USER_PASSWORD_INCORRECT",

  /**
   * External user not found
   */
  EXTERNAL_USER_NOT_FOUND = "HUB_ACTOR_EXTERNAL_USER_NOT_FOUND",

  /**
   * External user of other application
   */
  EXTERNAL_USER_DIFFERENT_APPLICATION = "HUB_ACTOR_EXTERNAL_USER_DIFFERENT_APPLICATION",

  /**
   * External user of different account
   */
  EXTERNAL_USER_DIFFERENT_USER = "HUB_ACTOR_EXTERNAL_USER_DIFFERENT_USER",

  /**
   * Not a Beta tester
   */
  NOT_BETA_USER = "HUB_ACTOR_NOT_BETA_USER",

  /**
   * Already an elite member
   */
  ALREADY_ELITE_MEMBER = "HUB_ACTOR_ALREADY_ELITE_MEMBER",

  /**
   * Already a villain member
   */
  ALREADY_VILLAIN_MEMBER = "HUB_ACTOR_ALREADY_VILLAIN_MEMBER",

  /**
   * No password and External User.
   */
  NO_EXTERNAL_USER_NO_PASSWORD = "HUB_ACTOR_NO_EXTERNAL_USER_NO_PASSWORD",

  EXTERNAL_USER_CONTENT_NOT_FOUND = "HUB_EXTERNAL_USER_CONTENT_NOT_FOUND",

  DUPLICATED_BETA_USER = "HUB_ACTOR_DUPLICATED_BETA_USER",

  /**
   * Customer is different.
   */
  DIFFERENT_CUSTOMER = "HUB_ACTOR_DIFFERENT_CUSTOMER",

  /**
   * Email verification not found.
   */
  EMAIL_VERIFICATION_NOT_FOUND = "HUB_ACTOR_EMAIL_VERIFICATION_NOT_FOUND",

  /**
   * Invalid verification.
   */
  INVALID_EMAIL_VERIFICATION = "HUB_ACTOR_INVALID_EMAIL_VERIFICATION",

  /**
   * Already verificated verification.
   */
  ALREADY_VERIFICATED_EMAIL_VERIFICATION = "HUB_ACTOR_ALREADY_VERIFICATED_EMAIL_VERIFICATION",

  /**
   * Verification Code is different.
   */
  INVALID_EMAIL_VERIFICATION_CODE = "HUB_ACTOR_INVALID_EMAIL_VERIFICATION_CODE",

  /**
   * Email Verification is expired.
   */
  EXPIRED_EMAIL_VERIFICATION = "HUB_ACTOR_EXPIRED_EMAIL_VERIFICATION",
}
