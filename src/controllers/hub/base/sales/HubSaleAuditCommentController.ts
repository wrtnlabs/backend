import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleAuditComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditComment";

import { HubSaleAuditCommentProvider } from "../../../../providers/hub/sales/audits/HubSaleAuditCommentProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubSaleAuditCommentController<
  Actor extends IHubSeller.IInvert | IHubAdministrator.IInvert,
>(props: IHubControllerProps<"admins" | "sellers">) {
  @Controller(`hub/${props.path}/sales/:saleId/audits/:auditId/comments`)
  class HubSaleAuditCommentController {
    /**
     * Bulk query review comment history.
     *
     * For a specific {@link IHubSaleAudit review post}, {@link IHubSeller sales party}
     * and {@link IHubAdministrator administrator} query
     * {@link IHubSaleAuditComment comments} in bulk.
     *
     * The returned information is {@link IPage paging} processed, and depending
     * on how the request information {@link IHubSaleAuditComment.IRequest} is set,
     * the number of records per page can be {@link IHubSaleAuditComment.IRequest.limit},
     * or only comments that meet a specific condition can be
     * {@link IHubSaleAuditComment.IRequest.search}, or the
     * {@link IHubSaleAuditComment.IRequest.sort sort condition} of the comments
     * can be set arbitrarily.
     *
     * @param saleId {@link IHubSale.id} of the property
     * @param auditId {@link IHubSaleAudit.id} of the audit
     * @param input page and search request information
     * @returns list of paged audit comments
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("auditId") auditId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleAuditComment.IRequest,
    ): Promise<IPage<IHubSaleAuditComment>> {
      return HubSaleAuditCommentProvider.index({
        actor,
        sale: { id: saleId },
        audit: { id: auditId },
        input,
      });
    }

    /**
     * View individual audit comments.
     *
     * View individual {@link IHubSaleAuditComment comments} written by
     * {@link IHubSeller selling party} or {@link IHubAdministrator administrator} for
     * a specific {@link IHubSaleAudit audit post}.
     *
     * @param saleId {@link IHubSale.id} of the listing
     * @param auditId {@link IHubSaleAudit.id} of the audit
     * @param id {@link IHubSaleAuditComment.id} of the comment
     * @returns comment information
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("auditId") auditId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubSaleAuditComment> {
      return HubSaleAuditCommentProvider.at({
        actor,
        sale: { id: saleId },
        audit: { id: auditId },
        id,
      });
    }

    /**
     * Write a review comment.
     *
     * Write a comment on a specific {@link IHubSaleAudit review post}
     *
     * @param saleId {@link IHubSale.id} of a specific listing
     * @param auditId {@link IHubSaleAudit.id} of a specific review
     * @param input Comment writing information
     * @returns Comment writing information
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Post()
    public create(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("auditId") auditId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleAuditComment.ICreate,
    ): Promise<IHubSaleAuditComment> {
      return HubSaleAuditCommentProvider.create({
        actor,
        sale: { id: saleId },
        audit: { id: auditId },
        input,
      });
    }

    /**
     * Editing comments on a review post.
     *
     * {@link IHubSaleAuditComment comment} written on a specific
     * {@link IHubSaleAudit review} post, {@link IHubSeller seller} or
     * {@link IHubAdministrator administrator} can edit it themselves.
     *
     * However, as is the policy that this hub system applies to comments in general,
     * editing this comment does not actually change the existing content. The edited
     * content is recorded as a new {@link IHubSaleAuditComment.ISnapshot snapshot},
     * accumulated in the existing comment. This is also made public to the
     * {@link IHubAdministrator administrator} and {@link IHubSeller seller}, so
     * anyone who can view the {@link IHubSaleAudit review} post can also view the
     * edit history.
     *
     * This is to prevent administrators or sellers from manipulating the situation
     * by editing their comments, etc., due to the nature of e-commerce, which is
     * prone to disputes. In other words, it is for the purpose of preserving
     * evidence.
     *
     * @param saleId {@link IHubSale.id} of the property to be attributed
     * @param auditId {@link IHubSaleAudit.id} of the attributed audit
     * @param id {@link IHubSaleAuditComment.id} of the comment to be modified
     * @param input Comment modification information
     * @returns Newly created snapshot content information
     * @tag Sale
     */
    @core.TypedRoute.Put(":id")
    public update(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("auditId") auditId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleAuditComment.IUpdate,
    ): Promise<IHubSaleAuditComment.ISnapshot> {
      return HubSaleAuditCommentProvider.update({
        actor,
        sale: { id: saleId },
        audit: { id: auditId },
        id,
        input,
      });
    }
  }
  return HubSaleAuditCommentController;
}
