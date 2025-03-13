export namespace OrderErrorCode {
  /**
   * Order not found
   */
  export const ORDER_NOT_FOUND = "ORDER_NOT_FOUND";

  /**
   * Cart Item Unit Not Found
   */
  export const CART_COMMODITY_UNIT_NOT_FOUND = "CART_COMMODITY_UNIT_NOT_FOUND";

  /**
   * Cart Item not found
   */
  export const CART_COMMODITY_NOT_FOUND = "CART_COMMODITY_NOT_FOUND";

  /**
   * Cart product inventory selection violation
   */
  export const CART_COMMODITY_STOCK_CHOICE_VALUE_VIOLATED =
    "CART_COMMODITY_STOCK_CHOICE_VALUE_VIOLATED";

  /**
   * The product has already been launched
   */
  export const GOOD_ALREADY_OPENED = "GOOD_ALREADY_OPENED";

  /**
   * The product has already ended
   */
  export const GOOD_ALREADY_CLOSED = "GOOD_ALREADY_CLOSED";

  /**
   * Unable to initiate order
   */
  export const CANNOT_OPENED_ORDER = "CANNOT_OPENED_ORDER";

  /**
   * Unable to end order
   */
  export const CANNOT_CLOSE_ORDER = "CANNOT_CLOSE_ORDER";

  /**
   * Product not found
   */
  export const GOOD_NOT_FOUND = "GOOD_NOT_FOUND";

  /**
   * Cannot set an end date without a start date
   */
  export const CANNOT_CONFIGURE_CLOSED_AT_WITHOUT_OPENED_AT =
    "CANNOT_CONFIGURE_CLOSED_AT_WITHOUT_OPENED_AT";

  /**
   * Already ordered
   */
  export const ALREADY_ORDERED = "ALREADY_ORDERED";

  /**
   * Order deletion denied
   */
  export const ORDER_ERASE_DENIED = "ORDER_ERASE_DENIED";

  /**
   * Order not issued
   */
  export const ORDER_NOT_PUBLISHED = "ORDER_NOT_PUBLISHED";

  /**
   * Order not initiated
   */
  export const ORDER_NOT_OPENED = "ORDER_NOT_OPENED";

  /**
   * Your order has already been cancelled
   */
  export const ORDER_ALREADY_CANCELLED = "ORDER_ALREADY_CANCELLED";

  /**
   * Order already issued
   */
  export const ORDER_ALREADY_PUBLISHED = "ORDER_ALREADY_PUBLISHED";

  /**
   * Expired Products
   */
  export const EXPIRED_GOOD = "EXPIRED_GOOD";

  /**
   * Invalid URL
   */
  export const INVALID_URL = "INVALID_URL";

  /**
   * Invalid HTTP method
   */
  export const INVALID_HTTP_METHOD = "INVALID_HTTP_METHOD";
}
