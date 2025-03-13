import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";

import { HubOrderGoodProvider } from "../../../../providers/hub/orders/HubOrderGoodProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubOrderGoodController } from "../../base/orders/HubOrderGoodController";

export class HubCustomerOrderGoodController extends HubOrderGoodController({
  path: "customers",
  AuthGuard: HubCustomerAuth,
}) {
  /**
   * Set the start time of the order contract.
   *
   * Set the start time of the contract for the target {@link IHubOrderGood product}.
   *
   * Unlike the order confirmation time, the effective time can be pushed back.
   *
   * And the effective time of the contract can be continuously edited until it arrives.
   *
   * Also, the monthly fixed fee is calculated based on the start date.
   *
   * Please note that after the customer purchases the seller's API, the review
   * and development process is necessary, so the effective date of the contract
   * cannot help but be pushed back further than the order confirmation.
   *
   * @param orderId {@link IHubOrder.id} of the order
   * @param id {@link IHubOrderGood.id} of the target order
   * @param input Edit information for the contract start date
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Put(":id/open")
  public open(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderGood.IOpen,
  ): Promise<void> {
    return HubOrderGoodProvider.open({
      customer,
      order: { id: orderId },
      id,
      input,
    });
  }

  /**
   * Set the end time of the order contract.
   *
   * Set the end time of the contract for the target {@link IHubOrderGood product}.
   *
   * However, the end time of the contract cannot be set immediately. Based on
   * the start time of the contract, it can only be cancelled after a period of
   * at least 1 month. And if the contract has already been started, it can also
   * only be terminated in 1-month units.
   *
   * @param orderId {@link IHubOrder.id} of the order to which it belongs
   * @param id {@link IHubOrderGood.id} of the target order
   * @param input Edit information for the end date of the contract
   * @author Samchon
   * @tag Order
   */
  @core.TypedRoute.Put(":id/close")
  public close(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderGood.IClose,
  ): Promise<void> {
    return HubOrderGoodProvider.close({
      customer,
      order: { id: orderId },
      id,
      input,
    });
  }
}
