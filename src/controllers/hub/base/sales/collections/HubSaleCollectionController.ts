import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleCollection } from "@wrtnlabs/os-api/lib/structures/hub/sales/collections/IHubSaleCollection";

import { HubSaleCollectionProvider } from "../../../../../providers/hub/sales/collections/HubSaleCollectionProvider";

import { IHubControllerProps } from "../../IHubControllerProps";

export function HubSaleCollectionController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/sales/collections`)
  class HubSaleCollectionController {
    /**
     * Index the summary information list of properties.
     *
     * {@link IHubSaleCollection.ISummary summary information of properties} is loaded.
     *
     * The returned {@link IHubSaleCollection.ISummary summary information} is
     * {@link IPage paging} processed. And depending on how the request information
     * {@link IHubSaleCollection.IRequest} is set, you can {@link IHubSaleCollection.IRequest.limit} limit
     * the number of records per page, {@link IHubSaleCollection.IRequest.search} search only
     * properties that satisfy a specific condition, or
     * {@link IHubSaleCollection.IRequest.sort sort conditions} of properties can be arbitrarily
     * specified.
     *
     * @param input page and search request information
     * @returns list of summary information of properties that have been paged
     * @author Asher
     * @tag Sale
     */
    @core.TypedRoute.Patch()
    async index(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubSaleCollection.IRequest,
    ): Promise<IPage<IHubSaleCollection.ISummary>> {
      return HubSaleCollectionProvider.index({
        actor,
        input,
      });
    }
  }

  return HubSaleCollectionController;
}
