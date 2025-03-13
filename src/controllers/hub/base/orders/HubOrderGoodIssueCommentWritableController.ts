import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubOrderGoodIssueComment } from "@wrtnlabs/os-api/lib/structures/hub/orders/issues/IHubOrderGoodIssueComment";

import { HubOrderGoodIssueCommentProvider } from "../../../../providers/hub/orders/issues/HubOrderGoodIssueCommentProvider";

import { IHubControllerProps } from "../IHubControllerProps";
import { HubOrderGoodIssueCommentReadableController } from "./HubOrderGoodIssueCommentReadableController";

export function HubOrderGoodIssueCommentWritableController<
  Actor extends IHubCustomer | IHubSeller.IInvert,
>(props: IHubControllerProps<"customers" | "sellers">) {
  class HubOrderGoodIssueCommentWritableController extends HubOrderGoodIssueCommentReadableController<Actor>(
    props,
  ) {
    /**
     * Create an Issue comment.
     *
     * Creates a {@link IHubOrderGoodIssueComment}.
     *
     * @param orderId {@link IHubOrder.id} of the target order
     * @param goodId {@link IHubOrderGood.id} of the target product
     * @param issueId {@link IHubOrderGoodIssue.id} of the target issue
     * @param input Information about the {@link IHubOrderGoodIssueComment} to be created
     * @returns Comment on the created issue
     * @author Asher
     * @tag Issue
     */
    @core.TypedRoute.Post()
    public create(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedParam("issueId") issueId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubOrderGoodIssueComment.ICreate,
    ): Promise<IHubOrderGoodIssueComment> {
      return HubOrderGoodIssueCommentProvider.create({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        issue: { id: issueId },
        input,
      });
    }

    /**
     * Modify Issue Comment.
     *
     * Modify {@link IHubOrderGoodIssueComment}.
     *
     * @param orderId {@link IHubOrder.id} of the target order
     * @param goodId {@link IHubOrderGood.id} of the target product
     * @param issueId {@link IHubOrderGoodIssue.id} of the target issue
     * @param id {@link IHubOrderGoodIssueComment.id} of the target comment
     * @param input Information about the {@link IHubOrderGoodIssueComment} to modify
     * @returns Snapshot of the comment of the modified issue
     * @author Asher
     * @tag Issue
     */
    @core.TypedRoute.Put("/:id")
    public update(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedParam("issueId") issueId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubOrderGoodIssueComment.IUpdate,
    ): Promise<IHubOrderGoodIssueComment.ISnapshot> {
      return HubOrderGoodIssueCommentProvider.update({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        issue: { id: issueId },
        id,
        input,
      });
    }

    /**
     * Delete Issue Comment.
     *
     * Delete {@link IHubOrderGoodIssueComment}.
     *
     * @param orderId {@link IHubOrder.id} of the target order
     * @param goodId {@link IHubOrderGood.id} of the target product
     * @param issueId {@link IHubOrderGoodIssue.id} of the target issue
     * @param id {@link IHubOrderGoodIssueComment.id} of the target comment
     * @returns void
     * @author Asher
     * @tag Issue
     */
    @core.TypedRoute.Delete("/:id")
    public erase(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedParam("issueId") issueId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<void> {
      return HubOrderGoodIssueCommentProvider.erase({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        issue: { id: issueId },
        id,
      });
    }
  }
  return HubOrderGoodIssueCommentWritableController;
}
