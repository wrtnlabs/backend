export const enum HubOrderGoodErrorCode {
  /**
   * The contract has not yet commenced.
   */
  NOT_OPENED = "HUB_ORDER_GOOD_NOT_OPENED",

  /**
   * The contract has ended.
   */
  CLOSED = "HUB_ORDER_GOOD_CLOSED",

  /**
   * The contract cannot be terminated.
   */
  CANNOT_CLOSE = "HUB_ORDER_GOOD_CANNOT_CLOSE",

  /**
   * The contract commencement date is later than the present.
   */
  OPENING_TIME_IS_EARLIER_THAN_NOW = "HUB_ORDER_GOOD_OPENING_TIME_IS_EARLIER_THAN_NOW",

  /**
   * The contract end date is set later than the contract start date.
   */
  CLOSING_TIME_IS_EARLIER_THAN_OPENING_TIME = "HUB_ORDER_GOOD_CLOSING_TIME_IS_EARLIER_THAN_OPENING_TIME",

  /**
   * The contract termination date is later than the present.
   */
  CLOSING_TIME_IS_EARLIER_THAN_NOW = "HUB_ORDER_GOOD_CLOSING_TIME_IS_EARLIER_THAN_NOW",

  /**
   * The contract has an end date set, but there is no actual start date.
   */
  CLOSING_TIME_WITHOUT_OPENING_TIME = "HUB_ORDER_GOOD_CLOSING_TIME_WITHOUT_OPENING_TIME",

  /**
   * Product not found.
   */
  NOT_FOUND = "HUB_ORDER_GOOD_NOT_FOUND",

  /**
   * Not on a contract.
   *
   * Maybe not opened yet or already closed.
   */
  NOT_ON_A_CONTRACT = "HUB_ORDER_GOOD_NOT_ON_A_CONTRACT",

  /**
   * The contract has already been initiated.
   */
  OPENED = "HUB_ORDER_GOOD_OPENED",

  /**
   * Invalid HTTP method
   */
  INVALID_HTTP_METHOD = "INVALID_HTTP_METHOD",

  /**
   * Invalid URL
   */
  INVALID_URL = "INVALID_URL",
}
