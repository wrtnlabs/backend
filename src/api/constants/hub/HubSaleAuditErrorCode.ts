export const enum HubSaleAuditErrorCode {
  /**
   * The review has already begun.
   */
  CREATED = "HUB_SALE_AUDIT_CREATED",

  /**
   * No review posts found
   */
  NOT_FOUND = "HUB_SALE_AUDIT_NOT_FOUND",

  /**
   * The review has already been approved
   */
  APPROVED = "HUB_SALE_AUDIT_APPROVED",

  /**
   * The review was not approved.
   */
  NOT_APPROVED = "HUB_SALE_AUDIT_NOT_APPROVED",
}
