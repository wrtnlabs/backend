import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrderGoodHistory } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGoodHistory";

import { HubOrderGoodHistoryProvider } from "../../../../providers/hub/orders/HubOrderGoodHistoryProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubOrderGoodHistoryController(props: IHubControllerProps) {
  @Controller(`hub/${props.path}/orders/:orderId/goods/:goodId/histories`)
  class HubOrderGoodHistoryController {
    /**
     * Bulk query the order execution history.
     *
     * @param orderId {@link IHubOrder.id} of the order
     * @param goodId {@link IHubOrderGood.id} of the order
     * @param input Request information for the order.
     * @returns List of paged order execution history
     * @author Asher
     * @tag Order
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: IHubActorEntity,
      @core.TypedParam("orderId")
      orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId")
      goodId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubOrderGoodHistory.IRequest,
    ): Promise<IPage<IHubOrderGoodHistory.ISummary>> {
      return HubOrderGoodHistoryProvider.index({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        input,
      });
    }

    /**
     * View individual execution history of ordered items.
     *
     * @param orderId {@link IHubOrder.id} of the order
     * @param goodId {@link IHubOrderGood.id} of the ordered item
     * @param id {@link IHubOrderGoodHistory.id} of the order item execution history
     * @author Asher
     * @tag Order
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: IHubActorEntity,
      @core.TypedParam("orderId")
      orderId: string & tags.Format<"uuid">,
      @core.TypedParam("goodId")
      goodId: string & tags.Format<"uuid">,
      @core.TypedParam("id")
      id: string & tags.Format<"uuid">,
    ): Promise<IHubOrderGoodHistory> {
      return HubOrderGoodHistoryProvider.at({
        actor,
        order: { id: orderId },
        good: { id: goodId },
        id,
      });
    }
  }
  return HubOrderGoodHistoryController;
}
