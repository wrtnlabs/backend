export const enum HubSaleErrorCode {
  /**
   * No listings found
   */
  SALE_NOT_FOUND = "HUB_SALE_NOT_FOUND",

  /**
   * No option candidates found
   */
  OPTION_CANDIDATE_NOT_FOUND = "HUB_SALE_UNIT_OPTION_CANDIDATE_NOT_FOUND",

  /**
   * Invalid option type
   */
  INVALID_OPTION_TYPE = "HUB_SALE_UNIT_OPTION_INVALID_TYPE",

  /**
   * The sale is not mine
   */
  OWNERSHIP = "HUB_SALE_OWNERSHIP",

  /**
   * No stock found
   */
  UNIT_STOCK_NOT_FOUND = "HUB_SALE_UNIT_STOCK_NOT_FOUND",

  /**
   * Price not found
   */
  STOCK_PRICE_NOT_FOUND = "HUB_SALE_UNIT_STOCK_PRICE_NOT_FOUND",

  /**
   * Sales are not discontinued
   */
  SALE_NOT_SUSPENDED = "HUB_SALE_NOT_SUSPENDED",

  /**
   * Sales have already been discontinued
   */
  SALE_ALREADY_SUSPENDED = "HUB_SALE_ALREADY_SUSPENDED",

  /**
   * Sale has already ended
   */
  SALE_ALREADY_CLOSED = "HUB_SALE_ALREADY_CLOSED",
  /**
   * Sales have already been suspended
   */
  SALE_ALREADY_PAUSED = "HUB_SALE_ALREADY_PAUSED",

  /**
   * Reviews are not allowed
   */
  NOT_ALLOWED_REVIEW = "NOT_ALLOWED_REVIEW",

  /**
   * No sales snapshot found
   */
  SNAPSHOT_NOT_FOUND = "HUB_SALE_SNAPSHOT_NOT_FOUND",

  /**
   * Unable to end sale
   */
  NOT_CLOSEABLE = "HUB_SALE_NOT_CLOSEABLE",

  /**
   * Sales not open
   */
  NOT_OPENED = "HUB_SALE_NOT_OPENED",

  /**
   * No sales units found
   */
  SNAPSHOT_UNIT_NOT_FOUND = "HUB_SALE_SNAPSHOT_UNIT_NOT_FOUND",

  /**
   * Existing sales unit name
   */
  EXIST_SNAPSHOT_UNIT_NAME = "EXIST_SNAPSHOT_UNIT_NAME",

  /**
   * Existing sales tags
   */
  EXIST_SNAPSHOT_TAG = "EXIST_SNAPSHOT_TAG",

  /**
   * No sales unit options found
   */
  UNIT_OPTION_NOT_FOUND = "SALE_UNIT_OPTION_NOT_FOUND",

  /**
   * The candidate is empty
   */
  EMPTY_OPTION_CANDIDATES = "EMPTY_OPTION_CANDIDATES",

  /**
   * Existing candidate names
   */
  EXIST_OPTION_CANDIDATE_NAME = "EXIST_OPTION_CANDIDATE_NAME",

  /**
   * Existing sales unit option name
   */
  EXIST_UNIT_OPTION_NAME = "EXIST_UNIT_OPTION_NAME",

  /**
   * No stock available
   */
  UNIT_STOCK_NOT_EXISTS = "UNIT_STOCK_NOT_EXISTS",

  /**
   * Stock count does not match
   */
  STOCK_INCORRECT_COUNT = "HUB_SALE_UNIT_STOCK_INCORRECT_COUNT",

  /**
   * Existing stock name
   */
  EXIST_STOCK_NAME = "EXIST_STOCK_NAME",

  /**
   * There is an option
   */
  STOCK_CHOICE_EXIST = "HUB_SALE_UNIT_STOCK_CHOICE_EXIST",

  /*
   * Failed to find bookmark
   */
  BOOKMARK_NOT_FOUND = "BOOKMARK_NOT_FOUND",

  /**
   * This bookmark is not mine
   */
  BOOKMARK_NOT_YOURS = "BOOKMARK_NOT_YOURS",

  /**
   * The collection does not exist
   */
  COLLECTION_NOT_FOUND = "HUB_SALE_COLLECTION_NOT_FOUND",

  /**
   * Sale details do not exist
   */
  CONTENT_NOT_FOUND = "CONTENT_NOT_FOUND",
}
