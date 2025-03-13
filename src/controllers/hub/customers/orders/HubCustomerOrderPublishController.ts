import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubOrderPublish } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderPublish";

import { HubOrderPublishProvider } from "../../../../providers/hub/orders/HubOrderPublishProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";

@Controller("hub/customers/orders/:id/publish")
export class HubCustomerOrderPublishController {
  /**
   * Check if the order can be confirmed.
   *
   * Check if the order can be confirmed.
   *
   * If it cannot be confirmed, the reason is returned as a message with
   * a status code such as 410 or 422. Conversely, if it can be confirmed,
   * a status code of 200 is returned.
   *
   * @param id {@link IHubOrder.id} of the target order
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Get("able")
  public able(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubOrderPublishProvider.able({
      customer,
      order: { id },
    });
  }

  /**
   * Confirm the order.
   *
   * Confirm the {@link IHubOrder order currently in the application stage},
   * that is, establish it as a contract.
   *
   * However, even if the contract is confirmed, it does not start immediately.
   * When confirming the contract, (or each ordered product) can set the
   * {@link IHubOrderGood.opened_at opening time} of the contract. This is designed
   * so that the opening time of the contract can be postponed because the customer
   * needs to analyze and develop the API after purchasing the seller.
   *
   * However, even if the opening time of the contract is later, the fixed cost for
   * the first month is converted to a deposit status when the contract takes effect.
   * Of course, the order contract can be canceled and refunded before the opening
   * time of the contract.
   *
   * @param id {@link IHubOrder.id} of the target order
   * @param input Input information for contract confirmation
   * @returns Contract confirmation information
   *
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Post()
  public create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderPublish.ICreate,
  ): Promise<IHubOrderPublish> {
    return HubOrderPublishProvider.create({
      customer,
      order: { id },
      input,
    });
  }

  /**
   * Batch application of order contract initiation time.
   *
   * The initiation time of the order contract is set for all
   * {@link IHubOrderGood products}.
   *
   * The effective time can be pushed back, unlike the order confirmation time.
   *
   * And the contract effective time can be continuously edited until it arrives.
   *
   * Also, the monthly fixed fee is calculated based on the initiation date.
   *
   * Please note that after the customer purchases the seller's API, the review
   * and development process is necessary, so the original contract effective time
   * cannot but be pushed back further than the order confirmation.
   *
   * > It is also possible to set a different initiation date for each order product.
   *
   * @param id {@link IHubOrder.id} of the target order
   * @param input Contract initiation date Edit information
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Put("open")
  public open(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderPublish.IOpen,
  ): Promise<void> {
    return HubOrderPublishProvider.open({
      customer,
      order: { id },
      input,
    });
  }

  /**
   * Apply the end date of the order contract in bulk.
   *
   * Set the end date of the order contract in bulk for all
   * {@link IHubOrderGood products}.
   *
   * However, the end date of the contract cannot be set immediately. From the
   * start date of the contract, it can only be cancelled after a minimum period
   * of 1 month has passed. And if the contract has already been started, it can
   * only be terminated in 1-month units.
   *
   * > It is also possible to set different end dates for each order product.
   *
   * @param id {@link IHubOrder.id} of the target order
   * @param input Edit information for the end date of the contract
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Put("close")
  public close(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderPublish.IClose,
  ): Promise<void> {
    return HubOrderPublishProvider.close({
      customer,
      order: { id },
      input,
    });
  }
}
