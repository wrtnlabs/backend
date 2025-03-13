export const enum HubOrderPublishErrorCode {
  /**
   * Order contract already issued
   */
  CREATED = "HUB_ORDER_PUBLISH_CREATED",

  /**
   * Unable to initiate order contract
   */
  CANNOT_OPEN = "HUB_ORDER_PUBLISH_CANNOT_OPEN",

  /**
   * Order not yet issued
   */
  NOT_CREATED = "HUB_ORDER_PUBLISH_NOT_CREATED",

  /**
   * The contract has not yet commenced.
   */
  NOT_OPENED = "HUB_ORDER_PUBLISH_NOT_OPENED",

  /**
   * The contract has ended.
   */
  CLOSED = "HUB_ORDER_PUBLISH_CLOSED",

  /**
   * The contract commencement date is later than the present.
   */
  OPENING_TIME_IS_EARLIER_THAN_NOW = "HUB_ORDER_PUBLISH_OPENING_TIME_IS_EARLIER_THAN_NOW",

  /**
   * The contract end date is set later than the contract start date.
   */
  CLOSING_TIME_IS_EARLIER_THAN_OPENING_TIME = "HUB_ORDER_PUBLISH_CLOSING_TIME_IS_EARLIER_THAN_OPENING_TIME",

  /**
   * The contract termination date is later than the present.
   */
  CLOSING_TIME_IS_EARLIER_THAN_NOW = "HUB_ORDER_PUBLISH_CLOSING_TIME_IS_EARLIER_THAN_NOW",

  /**
   * The contract has an end date set, but there is no actual start date.
   */
  CLOSING_TIME_WITHOUT_OPENING_TIME = "HUB_ORDER_PUBLISH_CLOSING_TIME_WITHOUT_OPENING_TIME",
}
