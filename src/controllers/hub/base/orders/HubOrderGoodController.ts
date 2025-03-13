import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";

import { HubOrderGoodProvider } from "../../../../providers/hub/orders/HubOrderGoodProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubOrderGoodController(props: IHubControllerProps) {
  @Controller(`hub/${props.path}/orders/:orderId/goods`)
  class HubOrderGoodController {
    /**
     * Bulk query of reverse reference information of ordered products.
     *
     * @param input Request information of ordered products
     * @returns List of reverse reference information of ordered products that have been paged
     * @author Samchon
     * @tag Order
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: IHubActorEntity,
      @core.TypedParam("orderId")
      orderId: null | (string & tags.Format<"uuid">),
      @core.TypedBody() input: IHubOrderGood.IRequest,
    ): Promise<IPage<IHubOrderGood.IInvert>> {
      return HubOrderGoodProvider.index({
        actor,
        order: orderId ? { id: orderId } : null,
        input,
      });
    }

    /**
     * Lookup the reverse reference information of the order item individually.
     *
     * @param orderId {@link IHubOrder.id} of the order
     * @param id {@link IHubOrderGood.id} of the target order item
     * @returns reverse reference information of the order item
     * @author Samchon
     * @tag Order
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: IHubActorEntity,
      @core.TypedParam("orderId")
      orderId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubOrderGood.IInvert> {
      return HubOrderGoodProvider.at({
        actor,
        order: { id: orderId },
        id,
      });
    }
  }
  return HubOrderGoodController;
}
