import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleQuestion } from "@wrtnlabs/os-api/lib/structures/hub/sales/inquiries/IHubSaleQuestion";

import { HubSaleQuestionProvider } from "../../../../providers/hub/sales/inquiries/HubSaleQuestionProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubSaleQuestionController } from "../../base/sales/inquiries/HubSaleQuestionController";

export class HubCustomerSaleQuestionController extends HubSaleQuestionController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Write a customer question.
   *
   * Create a customer question.
   *
   * @param saleId {@link IHubSale.id}
   * @param input Question creation information
   * @returns Created question
   * @author Asher
   * @tag Inquiry
   */
  @core.TypedRoute.Post()
  public create(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleQuestion.ICreate,
  ): Promise<IHubSaleQuestion> {
    return HubSaleQuestionProvider.create({
      customer,
      sale: { id: saleId },
      input,
    });
  }

  /**
   * Modify customer question.
   *
   * Modify customer question
   *
   * @param saleId corresponding {@link IHubSale.id}
   * @param id corresponding {@link IHubSaleQuestion.id}
   * @param input Modify question information
   * @returns Snapshot of modified question information
   * @author Asher
   * @tag Inquiry
   */
  @core.TypedRoute.Put(":id")
  public update(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleQuestion.IUpdate,
  ): Promise<IHubSaleQuestion.ISnapshot> {
    return HubSaleQuestionProvider.update({
      customer,
      sale: { id: saleId },
      id,
      input,
    });
  }
}
