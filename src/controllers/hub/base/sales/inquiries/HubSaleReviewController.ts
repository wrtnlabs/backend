import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleReview } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleReview";

import { HubSaleReviewProvider } from "../../../../../providers/hub/sales/inquiries/HubSaleReviewProvider";

import { IHubControllerProps } from "../../IHubControllerProps";

export function HubSaleReviewController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/sales/:saleId/reviews`)
  class HubSaleReviewController {
    /**
     * Retrieve a list of review summary information for a listing snapshot.
     *
     * Retrieve a list of summary information for {@link IHubSaleReview}.
     *
     * The returned {@link IHubSaleReview}s are {@link IPage paging} processed.
     *
     * Depending on how you set the request information {@link IHubSaleReview.IRequest},
     * you can {@link IHubSaleReview.IRequest.limit} limit the number of records per
     * page, {@link IHubSaleReview.IRequest.search} search reviews for listing
     * snapshots that meet a specific condition, or {@link IHubSaleReview.IRequest.sort}
     * randomly specify a sort condition for reviews for listing snapshots.
     *
     * @param saleId {@link IHubSale.id} of the sale in question
     * @param input list request information {@link IHubSaleReview.IRequest}
     * @return list of review summary information for paged listing snapshots
     * @author Asher
     * @tag Inquiry
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleReview.IRequest,
    ): Promise<IPage<IHubSaleReview.ISummary>> {
      return HubSaleReviewProvider.index({
        actor,
        sale: { id: saleId },
        input,
      });
    }

    /**
     * View review details for a listing snapshot.
     *
     * View a specific {@link IHubSaleReview}.
     *
     * @param saleId {@link IHubSale.id} of the sale in question
     * @param id {@link IHubSaleReview.id} to view
     * @return Review details for the viewed listing snapshot.
     * @author Asher
     * @tag Inquiry
     */
    @core.TypedRoute.Get(":id")
    public async at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubSaleReview> {
      return HubSaleReviewProvider.at({
        actor,
        sale: { id: saleId },
        id,
      });
    }

    /**
     * Delete a review for a listing.
     *
     * Delete a review for a specific listing.
     *
     * @param saleId {@link IHubSale.id} of the sale in question
     * @param id {@link IHubSaleReview.id} to query
     * @returns void
     * @tag Inquiry
     * @author Asher
     */
    @core.TypedRoute.Delete(":id")
    public async erase(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<void> {
      return HubSaleReviewProvider.erase({
        actor,
        sale: { id: saleId },
        id,
      });
    }
  }
  return HubSaleReviewController;
}
