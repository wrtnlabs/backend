import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrderGoodIssueComment } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueComment";

import { HubOrderGoodIssueCommentProvider } from "../../../../providers/hub/orders/issues/HubOrderGoodIssueCommentProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubOrderGoodIssueCommentReadableController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(
    `/hub/${props.path}/orders/:orderId/goods/:goodId/issues/:issueId/comments`,
  )
  class HubOrderGoodIssueCommentReadableController {
    /**
     * Issue comment list.
     *
     * Retrieve {@link IHubOrderGoodIssueComment} list.
     *
     * The returned {@link IHubOrderGoodIssueComment} are {@link IPage paging}
     * processed. And depending on how the request information
     * {@link IHubOrderGoodIssueComment.IRequest} is set, you can
     * {@link IHubOrderGoodIssueComment.IRequest.limit} limit the number of records
     * per page, {@link IHubOrderGoodIssueComment.IRequest.search} search only comments
     * that satisfy a specific condition, or
     * {@link IHubOrderGoodIssueComment.IRequest.sort sort condition} of the comments
     * can be arbitrarily specified.
     *
     * @param orderId target {@link IHubOrder.id}
     * @param goodId target {@link IHubOrderGood.id}
     * @param issueId target {@link IHubOrderGoodIssue.id}
     * @param input list request information {@link IHubOrderGoodIssueComment.IRequest}
     * @returns paged {@link IHubOrderGoodIssueComment} list {@link IPage}
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
      @core.TypedBody() input: IHubOrderGoodIssueComment.IRequest,
    ): Promise<IPage<IHubOrderGoodIssueComment>> {
      return HubOrderGoodIssueCommentProvider.index({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        issue: { id: issueId },
        input,
      });
    }

    /**
     * Issue Comment Lookup.
     *
     * @param orderId target {@link IHubOrder.id}
     * @param goodId target {@link IHubOrderGood.id}
     * @param issueId target {@link IHubOrderGoodIssue.id}
     * @param id target {@link IHubOrderGoodIssueComment.id}
     * @returns Comment information
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
    ): Promise<IHubOrderGoodIssueComment> {
      return HubOrderGoodIssueCommentProvider.at({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        issue: { id: issueId },
        id,
      });
    }
  }
  return HubOrderGoodIssueCommentReadableController;
}
