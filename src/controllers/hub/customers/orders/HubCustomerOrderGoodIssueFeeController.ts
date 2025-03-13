import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubOrderGoodIssueFee } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueFee";
import { IHubOrderGoodIssueFeeAccept } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueFeeAccept";

import { HubOrderGoodIssueFeeAcceptProvider } from "../../../../providers/hub/orders/issues/HubOrderGoodIssueFeeAcceptProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubOrderGoodIssueFeeController } from "../../base/orders/HubOrderGoodIssueFeeController";

export class HubCustomerOrderGoodIssueFeeController extends HubOrderGoodIssueFeeController(
  {
    AuthGuard: HubCustomerAuth,
    path: "customers",
  },
) {
  /**
   * Consent to pay the fee.
   *
   * Consent to pay the fee and pay the fee.
   *
   * @param orderId Target order {@link IHubOrder.id}
   * @param goodId Target product {@link IHubOrderGood.id}
   * @param issueId Target issue {@link IHubOrderGoodIssue.id}
   * @param id Target fee {@link IHubOrderGoodIssueFee.id}
   * @param input Consent to pay the fee {@link IHubOrderGoodIssueFeeAccept.ICreate}
   * @return Consent to pay the fee
   * @author Asher
   * @tag Issue
   */
  @core.TypedRoute.Post(":id")
  public accept(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
    @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
    @core.TypedParam("issueId") issueId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderGoodIssueFeeAccept.ICreate,
  ): Promise<IHubOrderGoodIssueFeeAccept> {
    return HubOrderGoodIssueFeeAcceptProvider.create({
      customer,
      order: { id: orderId },
      good: { id: goodId },
      issue: { id: issueId },
      fee: { id },
      input,
    });
  }

  /**
   * Cancels the fee payment.
   *
   * However, the fee payment cancellation is only possible before it is
   * {@link IHubOrderGoodIssueFeeAccept.published_at is confirmed}.
   *
   * @param orderId target order {@link IHubOrder.id}
   * @param goodId target product {@link IHubOrderGood.id}
   * @param issueId target issue {@link IHubOrderGoodIssue.id}
   * @param id target fee {@link IHubOrderGoodIssueFee.id}
   *
   * @author Samchon
   * @tag Issue
   */
  @core.TypedRoute.Put("/:id")
  public cancel(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
    @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
    @core.TypedParam("issueId") issueId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubOrderGoodIssueFeeAcceptProvider.cancel({
      customer,
      order: { id: orderId },
      good: { id: goodId },
      issue: { id: issueId },
      fee: { id },
    });
  }
}
