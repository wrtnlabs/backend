export const enum HubCartCommodityErrorCode {
  /**
   * The product (material) in your cart cannot be found.
   *
   * A bug that occurs when you enter {@link IHubCartCommodity.id} incorrectly when applying for an order or checking for a discount combination for an existing cart.
   */
  NOT_FOUND = "HUB_CART_COMMODITY_NOT_FOUND",

  /**
   * Could not find sub-unit of product to add to cart.
   *
   * Occurs when {@link IHubCartCommodityStock.ICreate.unit_id} is entered incorrectly.
   */
  UNIT_NOT_FOUND = "HUB_CART_COMMODITY_UNIT_NOT_FOUND",

  /**
   * Constructs a sub-unit to be added to the shopping cart, and its options are not found.
   *
   * Occurs when {@link IHubCartCommodityStockChoice.ICreate.option_id} is entered incorrectly.
   */
  UNIT_OPTION_NOT_FOUND = "HUB_CART_COMMODITY_UNIT_OPTION_NOT_FOUND",

  /**
   * It configures the sub-unit to be added to the shopping cart, and for certain options, the candidate value setting is required, but the request information does not describe this.
   *
   * If {@link IHubCartCommodityStockChoice.ICreate} configuration is omitted for the target option.
   */
  UNIT_OPTION_CANDIDATE_REQUIRED = "HUB_CART_COMMODITY_UNIT_OPTION_CANDIDATE_REQUIRED",

  /**
   * It configures the sub-unit to be added to the shopping cart, and some options require candidate values, but the candidate values are not found.
   *
   * Occurred when {@link IHubCartCommodityStockChoice.ICreate.value} input is missing.
   */
  UNIT_OPTION_CANDIDATE_NOT_FOUND = "HUB_CART_COMMODITY_UNIT_OPTION_CANDIDATE_NOT_FOUND",

  /**
   * It configures the sub-units to be added to the shopping cart, and certain options require descriptive values, but this is not written in the request information.
   *
   * {@link IHubCartCommodityStockChoice.value} is not required, but is entered.
   */
  UNIT_OPTION_VALUE_NOT_REQUIRED = "HUB_CART_COMMODITY_UNIT_OPTION_NOT_REQUIRED",

  /**
   * It configures a sub-unit to be added to the shopping cart, and a specific option requires a descriptive value, but its type is incorrectly written.
   *
   * This occurs when the type entered in {@link IHubCartCommodityStockChoice.value} is different from the one required by the option.
   */
  UNIT_OPTION_VALUE_WRONG_TYPE = "HUB_CART_COMMODITY_UNIT_OPTION_VALUE_WRONG_TYPE",
}
