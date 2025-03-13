import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import typia from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrderGoodCallAggregate } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/activity/IHubOrderGoodCallAggregate";
import { IHubOrderGoodRanking } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/activity/IHubOrderGoodRanking";

import { HubStatisticsOrderGoodCallProvider } from "../../../../providers/hub/statistics/HubStatisticsOrderGoodCallProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubStatisticsOrderGoodCallController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(`/hub/${props.path}/statistics/orders/goods/calls`)
  class HubStatisticsOrderGoodCallController {
    /**
     * View API call statistics for a specific period.
     *
     * View API usage, error rate, API latency, etc. of a product.
     *
     * @param input Search and page request information for the product to view
     * @return Statistical information about the API call history of the product.
     * @author Asher
     *
     * @tag Statistics
     */
    @core.TypedRoute.Patch()
    public async index(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubOrderGoodCallAggregate.IRequest,
    ): Promise<IPage<IHubOrderGoodCallAggregate>> {
      return HubStatisticsOrderGoodCallProvider.index({
        actor,
        input,
      });
    }

    /**
     * View API call statistics for the entire period.
     *
     * View API usage, error rate, API latency, etc. for the entire period of
     * the product.
     *
     * @param input Specific information about the target product or listing
     * @returns Statistics for the entire period of the product's API call history
     * @author Samchon
     *
     * @tag Statistics
     */
    @core.TypedRoute.Patch("entire")
    public entire(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubOrderGoodCallAggregate.IEntireRequest,
    ): Promise<IHubOrderGoodCallAggregate> {
      return HubStatisticsOrderGoodCallProvider.entire({
        actor,
        input,
      });
    }

    /**
     * Retrieves the ranking of a specific period of the subscribed API.
     *
     * @param input Search and page request information for the product to be retrieved
     * @return Statistical information about the API call history of the product.
     * @author Asher
     *
     * @tag Statistics
     * @todo not implemented yet
     */
    @core.TypedRoute.Patch("/ranking")
    async ranking(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubOrderGoodRanking.IEntireRequest,
    ): Promise<IPage<IHubOrderGoodRanking>> {
      actor;
      input;
      return typia.random<IPage<IHubOrderGoodRanking>>();
    }
  }
  return HubStatisticsOrderGoodCallController;
}
