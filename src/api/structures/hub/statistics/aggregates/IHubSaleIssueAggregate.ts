/**
 * Aggregated information on property-related issues.
 *
 * @author Samchon
 */
export interface IHubSaleIssueAggregate {
  /**
   * Number of issue posts.
   */
  count: number;

  /**
   * Number of issues resolved.
   */
  closed_count: number;

  /**
   * Number of open issues.
   */
  opened_count: number;

  /**
   * Statistical information about overpayments.
   */
  fee: IHubSaleIssueAggregate.IFee;
}
export namespace IHubSaleIssueAggregate {
  /**
   * Statistical information about overpayments.
   */
  export interface IFee {
    /**
     * Number of billing statements submitted.
     */
    count: number;

    /**
     * Number of accepted charges.
     */
    approved_count: number;

    /**
     * Total amount paid.
     */
    payment: number;
  }
}
