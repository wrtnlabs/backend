export const enum HubDepositErrorCode {
  /**
   * Deposit already issued
   */
  ALREADY_PUBLISHED = "HUB_DEPOSIT_ALREADY_PUBLISHED",

  /**
   * Deposit not issued
   */
  NOT_PUBLISHED = "HUB_DEPOSIT_NOT_PUBLISHED",

  /**
   * Deposit deletion denied
   */
  ERASE_DENIED = "HUB_DEPOSIT_ERASE_DENIED",
}
