import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { OpenApi } from "@samchon/openapi";
import "@wrtnlabs/schema";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleUnitSwaggerAccessor } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitSwaggerAccessor";

import { HubOrderGoodSnapshotProvider } from "../../../../providers/hub/orders/HubOrderGoodSnapshotProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubOrderGoodSnapshotController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/orders/:orderId/goods/:goodId/snapshots`)
  class HubOrderGoodSnapshotController {
    /**
     * Retrieve the list of available API snapshots from the ordered product.
     *
     * Retrieve the list of available APIs from the {@link IHubOrderGood product}
     * ordered by the customer. In other words, retrieve all available snapshots of
     * {@link IHubSaleSnapshot.IInvert.version versions} for the product ordered by
     * the customer.
     *
     * Note that the {@link IHubSaleUnitStock.price price information} recorded at
     * this time is not the price of the snapshot, but the price of the product
     * ordered by the customer. Also, the statistical information recorded in the
     * snapshot is only for the snapshot time. For example, in the case of
     * {@link IHubSaleGoodAggregate.call_count}, which means the total number of
     * API calls, the total number of calls for the snapshot time is recorded,
     * not the total number of calls for the attributed items.
     *
     * @param orderId {@link IHubOrder.id} of the order
     * @param goodId {@link IHubOrderGood.id} of the product
     * @param input Page request information
     * @returns List of paged snapshots
     *
     * @author Samchon
     * @tag Order
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IPage.IRequest,
    ): Promise<IPage<IHubSaleSnapshot.IInvert>> {
      return HubOrderGoodSnapshotProvider.index({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        input,
      });
    }

    /**
     * Retrieve a specific snapshot available from an ordered product.
     *
     * Retrieve a specific API
     * {@link IHubSaleSnapshot.IInvert snapshot} from the {@link IHubOrderGood product}
     * ordered by the customer. In other words, retrieve a snapshot of the current
     * or past {@link IHubSaleSnapshot.IInvert.version version} available for the
     * product ordered by the customer.
     *
     * Note that the {@link IHubSaleUnitStock.price price information} recorded at
     * this time is not the price of the snapshot, but the price of the product
     * ordered by the customer. In addition, the statistical information recorded in
     * the snapshot is also only for the snapshot time. For example, in the case of
     * {@link IHubSaleGoodAggregate.call_count}, which means the total number of
     * API calls, the total number of calls for the snapshot time is recorded,
     * not the total number of calls for the attributed items.
     *
     * @param orderId {@link IHubOrder.id} of the order
     * @param goodId {@link IHubOrderGood.id} of the product
     * @param id {@link IHubSaleSnapshot.IInvert.id} of the target snapshot
     * @returns snapshot information
     *
     * @author Samchon
     * @tag Order
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubSaleSnapshot.IInvert> {
      return HubOrderGoodSnapshotProvider.at({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        id,
      });
    }

    /**
     * Retrieve the Swagger document.
     *
     * For a specific {@link IHubSaleSnapshot.IInvert snapshot} available
     * from {@link IHubOrderGood Ordered Good}, specify the
     * {@link IHubSaleSnapshotUnit.IInvert unit} and fetch its
     * {@link OpenApi.IDocument Swagger document}.
     *
     * Each time an API is called in the returned Swagger document, the number
     * of API calls for that product is counted, the execution history is recorded,
     * and the deposit is charged if necessary.
     *
     * @param orderId {@link IHubOrder.id} of the bound order
     * @param goodId {@link IHubOrderGood.id} of the bound product
     * @param id {@link IHubSaleSnapshot.IInvert.id} of the target snapshot
     * @param input Identifier key for the target unit
     * @returns Swagger Documentation
     *
     * @author Samchon
     * @tag Order
     */
    @core.TypedRoute.Patch(":id/swagger")
    public swagger(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("orderId") orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId") goodId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleUnitSwaggerAccessor,
    ): Promise<OpenApi.IDocument> {
      return HubOrderGoodSnapshotProvider.getSwagger({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        id,
        input,
        proxy: true,
      });
    }
  }
  return HubOrderGoodSnapshotController;
}
