import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleInquiryComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryComment";

import { HubSaleInquiryCommentProvider } from "../../../../../providers/hub/sales/inquiries/HubSaleInquiryCommentProvider";

import { IHubControllerProps } from "../../IHubControllerProps";
import { HubSaleInquiryCommentReadableController } from "./HubSaleInquiryCommentReadableController";

export function HubSaleInquiryCommentWritableController<
  Actor extends IHubCustomer | IHubSeller.IInvert,
>(
  type: "questions" | "reviews",
  props: IHubControllerProps<"customers" | "sellers">,
) {
  class HubSaleInquiryCommentWritableController extends HubSaleInquiryCommentReadableController<Actor>(
    type,
    props,
  ) {
    /**
     * Write a query comment.
     *
     * Write a comment on the query.
     *
     * @param saleId {@link IHubSale.id} of the target sale
     * @param inquiryId {@link IHubSaleInquiry.id} of the target inquiry
     * @param input Information on the {@link IHubSaleInquiryComment} to be created
     * @returns Information on the generated query comment
     *
     * @author Asher
     * @tag Inquiry
     */
    @core.TypedRoute.Post()
    public create(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("inquiryId")
      inquiryId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleInquiryComment.ICreate,
    ): Promise<IHubSaleInquiryComment> {
      return HubSaleInquiryCommentProvider.create({
        actor,
        sale: { id: saleId },
        inquiry: { id: inquiryId },
        input,
      });
    }

    /**
     * Modify query comment.
     *
     * Modify the comment written in the query.
     *
     * @param saleId {@link IHubSale.id} of the target sale
     * @param inquiryId {@link IHubSaleInquiry.id} of the target inquiry
     * @param id {@link IHubSaleInquiryComment.id} of the target comment
     * @param input Information about {@link IHubSaleInquiryComment} to modify
     * @returns Information about the modified query comment
     * @author Asher
     * @tag Inquiry
     */
    @core.TypedRoute.Put(":id")
    public update(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("inquiryId")
      inquiryId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleInquiryComment.IUpdate,
    ): Promise<IHubSaleInquiryComment.ISnapshot> {
      return HubSaleInquiryCommentProvider.update({
        actor,
        sale: { id: saleId },
        inquiry: { id: inquiryId },
        id,
        input,
      });
    }

    /**
     * Delete query comment.
     *
     * Deletes the written query comment.
     *
     * @param saleId {@link IHubSale.id} of the target sale
     * @param inquiryId {@link IHubSaleInquiry.id} of the target inquiry
     * @param id {@link IHubSaleInquiryComment.id} of the target comment
     * @return void
     * @author Asher
     * @tag Inquiry
     */
    @core.TypedRoute.Delete(":id")
    public erase(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("inquiryId")
      inquiryId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<void> {
      return HubSaleInquiryCommentProvider.erase({
        actor,
        sale: { id: saleId },
        inquiry: { id: inquiryId },
        id,
      });
    }
  }
  return HubSaleInquiryCommentWritableController;
}
