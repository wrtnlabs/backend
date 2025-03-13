export const enum StudioAccountErrorCode {
  /**
   * The account could not be found.
   */
  NOT_FOUND = "STUDIO_ACCOUNT_NOT_FOUND",

  /**
   * Not the account owner.
   */
  OWNERSHIP = "STUDIO_ACCOUNT_OWNERSHIP",

  /**
   * There is a duplicate code for the account you are trying to create.
   */
  DUPLICATED = "STUDIO_ACCOUNT_DUPLICATED",

  /**
   * Those who already have an existing account.
   */
  HAVE = "STUDIO_ACCOUNT_HAVE",

  /**
   * It is not a corporate account.
   *
   * That is, it is a member's personal account.
   */
  NOT_ENTERPRISE = "STUDIO_ACCOUNT_NOT_ENTERPRISE",

  /**
   * It is not a member account.
   *
   * It is a corporate account.
   */
  NOT_MEMBER = "STUDIO_ACCOUNT_NOT_MEMBER",

  /**
   * The account is not a Studio Account.
   *
   * That means you need to create a Studio Account.
   */
  DOES_NOT_HAVE = "STUDIO_ACCOUNT_DOES_NOT_HAVE",
}
