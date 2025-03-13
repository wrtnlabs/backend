import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";

import { HubOrderProvider } from "../../../../providers/hub/orders/HubOrderProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubOrderController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/orders`)
  class HubOrderController {
    /**
     * Order list.
     *
     * Retrieve {@link IHubOrder} list.
     *
     * The returned {@link IHubOrder}s are {@link IPage paging} processed. And
     * depending on how the request information {@link IHubOrder.IRequest} is set,
     * you can {@link IHubOrder.IRequest.limit} limit the number of records per page,
     * {@link IHubOrder.IRequest.search} search only orders that satisfy a specific
     * condition, or {@link IHubOrder.IRequest.sort sort condition} of orders
     * arbitrarily.
     *
     * @param input list request information {@link IHubOrder.IRequest}
     * @returns paging {@link IHubOrder} list {@link IPage}
     * @author Asher
     * @tag Order
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubOrder.IRequest,
    ): Promise<IPage<IHubOrder>> {
      return HubOrderProvider.index({
        actor,
        input,
      });
    }

    /**
     * Order details.
     *
     * Retrieve a specific {@link IHubOrder}.
     *
     * @param id {@link IHubOrder.id} to retrieve
     * @return Retrieved {@link IHubOrder} information
     * @author Asher
     * @tag Order
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubOrder> {
      return HubOrderProvider.at({
        actor,
        id,
      });
    }
  }
  return HubOrderController;
}
