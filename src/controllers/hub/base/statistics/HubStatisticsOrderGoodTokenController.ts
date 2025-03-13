import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import typia from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrderGoodTokenAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/token/IHubOrderGoodTokenAggregate";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubStatisticsOrderGoodTokenController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(`/hub/${props.path}/statistics/orders/goods/tokens`)
  class HubStatisticsOrderGoodTokenController {
    @core.TypedRoute.Patch()
    async index(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubOrderGoodTokenAggregate.IEntireRequest,
    ): Promise<IPage<IHubOrderGoodTokenAggregate>> {
      actor;
      input;
      return typia.random<IPage<IHubOrderGoodTokenAggregate>>();
    }
  }

  return HubStatisticsOrderGoodTokenController;
}
