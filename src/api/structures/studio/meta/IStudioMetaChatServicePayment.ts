/**
 * Payment information in the Meta LLM chat.
 *
 * `IStudioMetaChatPayments` is a return type of the
 * {@link IStudioMetaChatListener.handlePayment} function which represents
 * the result of the payment process that is issued by the payment gateway
 * service.
 *
 * If the payment gateway service successfully processed the payment, its
 * result is represented by {@link IStudioMetaChatServicePayment.ISuccess}. Otherwise,
 * if the payment gateway service failed to process the payment, its result is
 * represented by {@link IStudioMetaChatServicePayment.IFailure}.
 *
 * @author Samchon
 */
export type IStudioMetaChatServicePayment =
  | IStudioMetaChatServicePayment.ISuccess
  | IStudioMetaChatServicePayment.IFailure;
export namespace IStudioMetaChatServicePayment {
  /**
   * Payment information of the success.
   */
  export interface ISuccess {
    /**
     * Success flag.
     */
    success: true;

    /**
     * Unique ID of the payment.
     *
     * The unique ID issued by the payment gateway service.
     */
    uid: string;

    /**
     * Vendor of the payment.
     *
     * The payment gateway service's name.
     */
    vendor: string;
  }

  /**
   * Payment information of the failure.
   */
  export interface IFailure {
    /**
     * Failure flag.
     */
    success: false;

    /**
     * The reason of the payment failure.
     *
     * The detailed reason of the payment failure,
     * described by the payment gateway service.
     */
    reason: string;
  }

  /**
   * Create information of the payment.
   *
   * The `IStudioMetaChatServicePayment.ICreate` is a parameter type of the
   * payment process through the payment gateway service. The frontend
   * developers, just deliver properties of the `IStudioMetaChatServicePayment.ICreate`
   * type to the payment gateway service's API or its embedded popup.
   */
  export interface ICreate {
    /**
     * Target order information.
     *
     * The order information that the citizen wants to pay.
     *
     * Note that, the `order` is not related to the payment gateway's unique
     * transaction ID. The `order` comes from the target API function.
     */
    order: IOrder;

    /**
     * The citizen who've requested the payment.
     */
    citizen: ICitizen;

    /**
     * Amount of the payment.
     */
    amount: number;

    /**
     * Currency of the payment.
     */
    currency: string;
  }

  /**
   * Target order information.
   */
  export interface IOrder {
    /**
     * Unique ID of the target order.
     *
     * Note that, the `id` is not related to the payment gateway's unique
     * transaction ID. The `id` comes from the target API function.
     */
    id: string;

    /**
     * Name of the target order.
     */
    name: string | null;
  }

  /**
   * The citizen who've requested the payment.
   */
  export interface ICitizen {
    /**
     * Unique ID of the citizen.
     */
    id: string | null;

    /**
     * Name of the citizen.
     */
    name: string;

    /**
     * Mobile phone number of the citizen.
     */
    mobile: string;

    /**
     * Email address of the citizen.
     */
    email: string | null;
  }
}
