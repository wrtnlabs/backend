import core from "@nestia/core";
import { tags } from "typia";

import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleInquiryAnswer } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleInquiryAnswer";

import { HubSaleInquiryAnswerProvider } from "../../../../providers/hub/sales/inquiries/HubSaleInquiryAnswerProvider";

import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSaleQuestionController } from "../../base/sales/inquiries/HubSaleQuestionController";

export class HubSellerSaleQuestionController extends HubSaleQuestionController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {
  /**
   * Write a response to a listing question.
   *
   * The seller writes a response to a listing question.
   *
   * @param saleId specific {@link IHubSale.id}
   * @param questionId specific {@link IHubSaleInquiry.id}
   * @param input Question information to create.
   * @return Asher
   * @author Asher
   * @tag Inquiry
   */
  @core.TypedRoute.Post(":questionId")
  public create(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("questionId") questionId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleInquiryAnswer.ICreate,
  ): Promise<IHubSaleInquiryAnswer> {
    return HubSaleInquiryAnswerProvider.create({
      seller,
      sale: { id: saleId },
      inquiry: { id: questionId },
      input,
    });
  }

  /**
   * Modify an answer to a listing question.
   *
   * The seller modifies an answer to a listing question.
   *
   * @param saleId specific {@link IHubSale.id}
   * @param questionId specific {@link IHubSaleInquiry.id}
   * @param input The answer information to modify.
   * @return A snapshot of the modified answer information
   * @author Asher
   * @tag Inquiry
   */
  @core.TypedRoute.Put(":questionId")
  public update(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("questionId") questionId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleInquiryAnswer.IUpdate,
  ): Promise<IHubSaleInquiryAnswer.ISnapshot> {
    return HubSaleInquiryAnswerProvider.update({
      seller,
      sale: { id: saleId },
      inquiry: { id: questionId },
      input,
    });
  }
}
