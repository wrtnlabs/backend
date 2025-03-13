import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";

import { HubSaleInquiryLikeProvider } from "../../../../../../providers/hub/sales/inquiries/likes/HubSaleInquiryQuestionLikeProvider";

import { IHubControllerProps } from "../../../IHubControllerProps";

export function HubSaleInquiryLikeController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/sales/:saleId/questions/:inquiryId/likes`)
  class HubSaleInquiryLikeController {
    /**
     * Generate a like for a product inquiry.
     *
     * @param actor The requester
     * @param saleId The {@link IHubSale.id} of the sale being requested
     * @param inquiryId
     */
    @core.TypedRoute.Post()
    public create(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("inquiryId")
      inquiryId: string & tags.Format<"uuid">,
    ) {
      return HubSaleInquiryLikeProvider.create({
        actor,
        sale: { id: saleId },
        inquiry: { id: inquiryId },
      });
    }

    /**
     * Delete Like for Product Inquiry.
     *
     * @param actor Requester
     * @param saleId {@link IHubSale.id} of the sale
     * @param inquiryId
     * @tag Inquiry
     * @tag Like
     */
    @core.TypedRoute.Delete()
    public erase(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("inquiryId")
      inquiryId: string & tags.Format<"uuid">,
    ) {
      return HubSaleInquiryLikeProvider.erase({
        actor,
        sale: { id: saleId },
        inquiry: { id: inquiryId },
      });
    }
  }
  return HubSaleInquiryLikeController;
}
