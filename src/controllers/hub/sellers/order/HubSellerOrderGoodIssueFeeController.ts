import core from "@nestia/core";
import { tags } from "typia";

import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubOrderGoodIssueFee } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueFee";

import { HubOrderGoodIssueFeeProvider } from "../../../../providers/hub/orders/issues/HubOrderGoodIssueFeeProvider";

import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubOrderGoodIssueFeeController } from "../../base/orders/HubOrderGoodIssueFeeController";

export class HubSellerOrderGoodIssueFeeController extends HubOrderGoodIssueFeeController(
  {
    AuthGuard: HubSellerAuth,
    path: "sellers",
  },
) {
  /**
   * Offer a fee.
   *
   * The seller offers a fee for the issue.
   *
   * @param orderId {@link IHubOrder.id} of the target order
   * @param goodId {@link IHubOrderGood.id} of the target product
   * @param issueId {@link IHubOrderGoodIssue.id} of the target issue
   * @param input Information about the {@link IHubOrderGoodIssueFee} to be created
   * @return Information about the fee offer to be created
   * @author asher
   * @tag Issue
   */
  @core.TypedRoute.Post()
  public create(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
    @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
    @core.TypedParam("issueId") issueId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderGoodIssueFee.ICreate,
  ): Promise<IHubOrderGoodIssueFee> {
    return HubOrderGoodIssueFeeProvider.create({
      seller,
      order: { id: orderId },
      good: { id: goodId },
      issue: { id: issueId },
      input,
    });
  }

  /**
   * Delete the commission fee offer.
   *
   * Delete the commission fee offered by the seller.
   *
   * @param orderId {@link IHubOrder.id} of the target order
   * @param goodId {@link IHubOrderGood.id} of the target product
   * @param issueId {@link IHubOrderGoodIssue.id} of the target issue
   * @param id {@link IHubOrderGoodIssueFee.id} of the target commission fee
   * @return void
   * @author Asher
   * @tag Issue
   */
  @core.TypedRoute.Delete("/:id")
  public erase(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
    @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
    @core.TypedParam("issueId") issueId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubOrderGoodIssueFeeProvider.erase({
      seller,
      order: { id: orderId },
      good: { id: goodId },
      issue: { id: issueId },
      id,
    });
  }
}
