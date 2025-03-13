import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleRecommend } from "@wrtnlabs/os-api/lib/structures/hub/sales/recommend/IHubSaleRecommend";

import { HubSaleRecommendProvider } from "../../../../../providers/hub/sales/recommend/HubSaleRecommendProvider";

import { IHubControllerProps } from "../../IHubControllerProps";

export function HubSaleRecommendController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/sales/recommendations`)
  class HubSaleRecommendController {
    @core.TypedRoute.Patch()
    async index(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubSaleRecommend.IRequest,
    ): Promise<IPage<IHubSaleRecommend.ISummary>> {
      return HubSaleRecommendProvider.index({
        actor,
        input,
      });
    }
  }
  return HubSaleRecommendController;
}
