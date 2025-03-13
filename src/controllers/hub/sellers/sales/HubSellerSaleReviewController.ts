import core from "@nestia/core";
import { tags } from "typia";

import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleInquiryAnswer } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryAnswer";

import { HubSaleInquiryAnswerProvider } from "../../../../providers/hub/sales/inquiries/HubSaleInquiryAnswerProvider";

import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSaleReviewController } from "../../base/sales/inquiries/HubSaleReviewController";

export class HubSellerSaleReviewController extends HubSaleReviewController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {
  /**
   * Generate a response to a listing review.
   *
   * @param saleId {@link IHubSale.id} of a specific listing
   * @param reviewId {@link IHubSaleReview.id} of a review of a specific listing
   * @param input Information about the response to generate
   * @return Information about the generated response
   * @author Asher
   * @tag Inquiry
   */
  @core.TypedRoute.Post(":reviewId")
  public create(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("reviewId") reviewId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleInquiryAnswer.ICreate,
  ): Promise<IHubSaleInquiryAnswer> {
    return HubSaleInquiryAnswerProvider.create({
      seller,
      sale: { id: saleId },
      inquiry: { id: reviewId },
      input,
    });
  }

  /**
   * Modify a response to a listing review.
   *
   * @param saleId {@link IHubSale.id} of a specific listing
   * @param reviewId {@link IHubSaleReview.id} of a review of a specific listing
   * @param input Information about the response to be modified
   * @returns Information about the modified response
   * @author Asher
   * @tag Inquiry
   */
  @core.TypedRoute.Put(":reviewId")
  public update(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("reviewId") reviewId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleInquiryAnswer.IUpdate,
  ): Promise<IHubSaleInquiryAnswer.ISnapshot> {
    return HubSaleInquiryAnswerProvider.update({
      seller,
      sale: { id: saleId },
      inquiry: { id: reviewId },
      input,
    });
  }
}
