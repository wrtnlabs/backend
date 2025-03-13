import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleReview } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleReview";

import { HubSaleReviewProvider } from "../../../../providers/hub/sales/inquiries/HubSaleReviewProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSaleReviewController } from "../../base/sales/inquiries/HubSaleReviewController";

export class HubCustomerSaleReviewController extends HubSaleReviewController({
  path: "customers",
  AuthGuard: HubCustomerAuth,
}) {
  /**
   * Write a customer listing snapshot review.
   *
   * A customer writes a review on a listing snapshot.
   *
   * @param saleId corresponding {@link IHubSale.id}
   * @param input review creation information
   * @return generated review information
   * @author Asher
   * @tag Inquiry
   */
  @core.TypedRoute.Post()
  public create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleReview.ICreate,
  ): Promise<IHubSaleReview> {
    return HubSaleReviewProvider.create({
      customer,
      sale: { id: saleId },
      input,
    });
  }

  /**
   * Modify a customer listing snapshot review.
   *
   * Modify a customer review on a listing snapshot.
   *
   * @param saleId the {@link IHubSale.id}
   * @param id of a specific review {@link IHubSaleReview.id}
   * @param input review modification information
   * @return a snapshot of the modified review information
   * @author Asher
   * @tag Inquiry
   */
  @core.TypedRoute.Put(":id")
  public update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleReview.IUpdate,
  ): Promise<IHubSaleReview.ISnapshot> {
    return HubSaleReviewProvider.update({
      customer,
      sale: { id: saleId },
      id,
      input,
    });
  }
}
