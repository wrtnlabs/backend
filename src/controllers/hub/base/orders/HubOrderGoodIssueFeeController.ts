import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrderGoodIssueFee } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueFee";

import { HubOrderGoodIssueFeeProvider } from "../../../../providers/hub/orders/issues/HubOrderGoodIssueFeeProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubOrderGoodIssueFeeController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(
    `hub/${props.path}/orders/:orderId/goods/:goodId/issues/:issueId/fees`,
  )
  class HubOrderGoodIssueFeeController {
    /**
     * Retrieve the fee list.
     *
     * Retrieve the list of {@link IHubOrderGoodIssueFee}.
     *
     * The returned {@link IHubOrderGoodIssueFee}s are {@link IPage paging}
     * processed. And depending on how the request information
     * {@link IHubOrderGoodIssueFee.IRequest} is set, you can
     * {@link IHubOrderGoodIssueFee.IRequest.limit} limit the number of records per
     * page, {@link IHubOrderGoodIssueFee.IRequest.search} search only fees that
     * satisfy a specific condition, or
     * {@link IHubOrderGoodIssueFee.IRequest.sort sort condition} of fees
     * arbitrarily specified.
     *
     * @param orderId {@link IHubOrder.id} of the target order
     * @param goodId {@link IHubOrderGood.id} of the target product
     * @param issueId {@link IHubOrderGoodIssue.id} of the target issue
     * @param input List request information {@link IHubOrderGoodIssueFee.IRequest}
     * @return List of paged commission fees
     *
     * @author Asher
     * @tag Issue
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedParam("issueId") issueId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubOrderGoodIssueFee.IRequest,
    ): Promise<IPage<IHubOrderGoodIssueFee>> {
      return HubOrderGoodIssueFeeProvider.index({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        issue: { id: issueId },
        input,
      });
    }

    /**
     * Query individual commission fees.
     *
     * Query individual commission fee records.
     *
     * @param orderId {@link IHubOrder.id} of target order
     * @param goodId {@link IHubOrderGood.id} of target product
     * @param issueId {@link IHubOrderGoodIssue.id} of target issue
     * @param id {@link IHubOrderGoodIssueFee.id} of target commission fee
     * @returns commission fee information
     *
     * @author Samchon
     * @tag Issue
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedParam("issueId") issueId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubOrderGoodIssueFee> {
      return HubOrderGoodIssueFeeProvider.at({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        issue: { id: issueId },
        id,
      });
    }
  }
  return HubOrderGoodIssueFeeController;
}
