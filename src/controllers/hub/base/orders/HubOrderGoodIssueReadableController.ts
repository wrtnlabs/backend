import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrderGoodIssue } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssue";

import { HubOrderGoodIssueProvider } from "../../../../providers/hub/orders/issues/HubOrderGoodIssueProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubOrderGoodIssueReadableController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(`/hub/${props.path}/orders/:orderId/goods/:goodId/issues`)
  class HubOrderGoodIssueReadableController {
    /**
     * View the Issue Summary Information List.
     *
     * View the summary information list of {@link IHubOrderGoodIssue}.
     *
     * The returned {@link IHubOrderGoodIssue}s are {@link IPage paging} processed.
     *
     * And depending on how the request information {@link IHubOrderGoodIssue.IRequest}
     * is set, you can {@link IHubOrderGoodIssue.IRequest.limit} limit the number
     * of records per page, {@link IHubOrderGoodIssue.IRequest.search} search only
     * issues that satisfy a specific condition, or
     * {@link IHubOrderGoodIssue.IRequest.sort sort conditions} of the issues can be
     * arbitrarily specified.
     *
     * @param orderId {@link IHubOrder.id} of the target order
     * @param goodId {@link IHubOrderGood.id} of the target product
     * @param input List request information {@link IHubOrderGoodIssue.IRequest}
     * @return Summary information list of paged issues
     * @author Asher
     * @tag Issue
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubOrderGoodIssue.IRequest,
    ): Promise<IPage<IHubOrderGoodIssue.ISummary>> {
      return HubOrderGoodIssueProvider.index({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        input,
      });
    }

    /**
     * View Issue Details.
     *
     * Retrieve details of {@link IHubOrderGoodIssue}.
     *
     * Used when retrieving details of a specific issue.
     *
     * @param orderId {@link IHubOrder.id} of the target order
     * @param goodId {@link IHubOrderGood.id} of the target product
     * @param id {@link IHubOrderGoodIssue.id} of the target issue
     * @return Issue details
     * @author Asher
     * @tag Issue
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubOrderGoodIssue> {
      return HubOrderGoodIssueProvider.at({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        id,
      });
    }
  }
  return HubOrderGoodIssueReadableController;
}
