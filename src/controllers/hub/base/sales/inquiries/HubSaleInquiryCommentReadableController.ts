import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleInquiryComment } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryComment";

import { HubSaleInquiryCommentProvider } from "../../../../../providers/hub/sales/inquiries/HubSaleInquiryCommentProvider";

import { IHubControllerProps } from "../../IHubControllerProps";

export function HubSaleInquiryCommentReadableController<
  Actor extends IHubActorEntity,
>(type: "questions" | "reviews", props: IHubControllerProps) {
  @Controller(`hub/${props.path}/sales/:saleId/${type}/:inquiryId/comments`)
  class HubSaleInquiryCommentReadableController {
    /**
     * View the list of comments for product inquiries.
     *
     * View the {@link IHubSaleInquiryComment} list.
     *
     * The returned {@link IHubSaleInquiryComment}s are processed with
     * {@link IPage paging}. And depending on how the request information
     * {@link IHubSaleInquiryComment.IRequest} is set, you can
     * {@link IHubSaleInquiryComment.IRequest.limit} limit the number of records
     * per page, {@link IHubSaleInquiryComment.IRequest.search} search for comments
     * for product inquiries that satisfy a specific condition, or
     * {@link IHubSaleInquiryComment.IRequest.sort} arbitrarily specify the sort
     * condition for comments for product inquiries.
     *
     * @param saleId {@link IHubSale.id} of the target sale
     * @param inquiryId {@link IHubSaleInquiry.id} of the target inquiry
     * @param input list request information {@link IHubSaleInquiryComment.IRequest}
     * @return paged {@link IHubSaleInquiryComment} list
     * @author Asher
     * @tag Inquiry
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("inquiryId")
      inquiryId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleInquiryComment.IRequest,
    ): Promise<IPage<IHubSaleInquiryComment>> {
      return HubSaleInquiryCommentProvider.index({
        actor,
        sale: { id: saleId },
        inquiry: { id: inquiryId },
        input,
      });
    }

    /**
     * Retrieve a specific comment for a product inquiry.
     *
     * Retrieve a specific {@link IHubSaleInquiryComment}.
     *
     * @param saleId {@link IHubSale.id} of the sale
     * @param inquiryId {@link IHubSaleInquiry.id} of the inquiry
     * @param id {@link IHubSaleInquiryComment.id} to retrieve
     * @return Comment for the retrieved product inquiry
     * @tag Inquiry
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("inquiryId")
      inquiryId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubSaleInquiryComment> {
      return HubSaleInquiryCommentProvider.at({
        actor,
        sale: { id: saleId },
        inquiry: { id: inquiryId },
        id,
      });
    }
  }
  return HubSaleInquiryCommentReadableController;
}
