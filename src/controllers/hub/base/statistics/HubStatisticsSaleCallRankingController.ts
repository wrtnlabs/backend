import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleCallRanking } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/activity/IHubSaleCallRanking";

import { HubStatisticsSaleCallRankingProvider } from "../../../../providers/hub/statistics/HubStatisticsSaleCallRankingProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubStatisticsSaleCallRankingController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(`hub/${props.path}/statistics/sales/calls/rankings`)
  class HubStatisticsSaleCallRankingController {
    /**
     * Search for rankings based on the number of API calls for a listing.
     *
     * Search for listings with the highest rankings based on the number of times
     * the API was called when the listing was ordered.
     *
     * The total searchable ranking is up to 100, and if there is a tie between
     * different listings, the processing is as follows.
     *
     * 1. Listing with the most API calls
     * 2. Listing with the most successful API calls
     * 3. Listing created faster
     *
     * @param input Page request information
     * @returns Paging processed ranking information
     * @author Samchon
     *
     * @tag Statistics
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IPage.IRequest,
    ): Promise<IPage<IHubSaleCallRanking>> {
      return HubStatisticsSaleCallRankingProvider.index({
        actor,
        input,
      });
    }
  }
  return HubStatisticsSaleCallRankingController;
}
