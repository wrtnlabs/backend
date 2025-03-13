export const enum HubOrderGoodIssueErrorCode {
  /**
   * The issue is not yours
   */
  ISSUE_NOT_YOURS = "HUB_ORDER_GOOD_ISSUE_NOT_YOURS",

  /**
   * Issue comment is not yours
   */
  ISSUE_COMMENT_NOT_YOURS = "HUB_ORDER_GOOD_ISSUE_COMMENT_NOT_YOURS",

  /**
   * Issue fee already approved
   */
  ISSUE_FEE_ALREADY_ACCEPTED = "HUB_ORDER_GOOD_ISSUE_FEE_ALREADY_ACCEPTED",

  /**
   * Issue fee not yet approved
   */
  ISSUE_FEE_NOT_ACCEPTED = "HUB_ORDER_GOOD_ISSUE_FEE_NOT_ACCEPTED",

  /**
   * Issue fee has already been cancelled
   */
  ISSUE_FEE_ALREADY_CANCELLED = "HUB_ORDER_GOOD_ISSUE_FEE_ALREADY_CANCELLED",

  /**
   * Issue fee already issued
   */
  ISSUE_FEE_ALREADY_PUBLISHED = "HUB_ORDER_GOOD_ISSUE_FEE_ALREADY_PUBLISHED",
}
