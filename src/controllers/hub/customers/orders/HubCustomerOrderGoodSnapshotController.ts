import core from "@nestia/core";
import { Request } from "@nestjs/common";
import { tags } from "typia";

import { IExecutionResult } from "@wrtnlabs/os-api/lib/structures/common/IExecutionResult";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubOrderGoodHistory } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGoodHistory";

import { HubOrderGoodSnapshotProvider } from "../../../../providers/hub/orders/HubOrderGoodSnapshotProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { HubOrderGoodSnapshotController } from "../../base/orders/HubOrderGoodSnapshotController";

export class HubCustomerOrderGoodSnapshotController extends HubOrderGoodSnapshotController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * The product executor that I purchased.
   *
   * @param orderId {@link IHubOrder.id} of the order
   * @param goodId {@link IHubOrderGood.id} of the product
   * @param id snapshot of the product
   * @param input input required to execute
   * @return execution result
   * @tag Order
   * @author Asher
   */
  @core.TypedRoute.Post("/:id/execute")
  public execute(
    @Request() request: any,
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
    @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderGood.IExecute,
  ): Promise<IExecutionResult<any>> {
    return HubOrderGoodSnapshotProvider.execute({
      customer,
      order: { id: orderId },
      good: { id: goodId },
      headers: request.headers,
      id,
      input,
    });
  }

  /**
   * Proceed with the product I purchased.
   *
   * Execute the purchased product, but do not wait for its return value,
   * but simply return {@link IHubOrderGood} corresponding to the execution result.
   *
   * @param orderId {@link IHubOrder.id} of the order
   * @param goodId {@link IHubOrderGood.id} of the ordered product
   * @param id snapshot of the ordered product {@link IHubSaleSnapshot.id}
   * @param input Input required to execute
   * @return execution result
   * @tag Order
   * @author Asher
   */
  @core.TypedRoute.Post("/:id/proceed")
  public proceed(
    @Request() request: any,
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
    @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubOrderGood.IExecute,
  ): Promise<IHubOrderGoodHistory> {
    return HubOrderGoodSnapshotProvider.proceed({
      customer,
      order: { id: orderId },
      good: { id: goodId },
      headers: request.headers,
      id,
      input,
    });
  }
}
