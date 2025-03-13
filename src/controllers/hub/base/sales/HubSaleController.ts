import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { OpenApi } from "@samchon/openapi";
import "@wrtnlabs/schema";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleUnitSwaggerAccessor } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitSwaggerAccessor";

import { HubSaleProvider } from "../../../../providers/hub/sales/HubSaleProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubSaleController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/sales`)
  class HubSaleController {
    /**
     * View the summary information list of properties.
     *
     * {@link IHubSale.ISummary summary information of properties} is loaded.
     *
     * The returned {@link IHubSale.ISummary summary information} is
     * {@link IPage paging} processed. And depending on how the request information
     * {@link IHubSale.IRequest} is set, you can {@link IHubSale.IRequest.limit} limit
     * the number of records per page, {@link IHubSale.IRequest.search} search only
     * properties that satisfy a specific condition, or
     * {@link IHubSale.IRequest.sort sort conditions} of properties can be arbitrarily
     * specified.
     *
     * @param input page and search request information
     * @returns list of summary information of properties that have been paged
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubSale.IRequest,
    ): Promise<IPage<IHubSale.ISummary>> {
      return HubSaleProvider.index({
        actor,
        input,
      });
    }

    /**
     * List up every sales.
     *
     * List up every {@link IHubSale sales} with detailed information.
     *
     * As you can see, returned sales are detailed, not summarized. If you want
     * to get the summarized information of sale for a brief, use {@link index}
     * function instead.
     *
     * For reference, if you're a {@link IHubSeller seller}, you can only
     * access to the your own {@link IHubSale sale}s. Otherwise you're a
     * {@link IHubCustomer customer}, you can see only the operating sales
     * in the market. Instead, you can't see the unopened, closed, or suspended
     * sales.
     *
     * By the way, if you want, you can limit the result by configuring
     * {@link IHubSale.IRequest.search search condition} in the request
     * body. Also, it is possible to customize sequence order of records by
     * configuring {@link IHubSale.IRequest.sort sort condition}.
     *
     * @param input Request info of pagination, searching and sorting
     * @returns Paginated sales with detailed information
     * @tag Sale
     *
     * @author Samchon
     */
    @core.TypedRoute.Patch("details")
    public details(
      @props.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubSale.IRequest,
    ): Promise<IPage<IHubSale>> {
      return HubSaleProvider.details({
        actor,
        input,
      });
    }

    /**
     * View detailed listings.
     *
     * View the target listing's detailed information {@link IHubSale}.
     *
     * However, depending on who is viewing the listing, the detailed attribute values
     * may vary. The most representative one is {@link IHubSaleUnitSwagger.host},
     * which contains the middleware API address of this hub system when the viewing
     * subject is a customer, and the commercial server API address registered by the
     * seller/administrator when the viewing subject is a seller/administrator.
     *
     * @param id Target listing's {@link IHubSale.id}
     * @returns Listing details
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubSale> {
      return HubSaleProvider.at({
        actor,
        id,
        strict: true,
      });
    }

    /**
     * Retrieve Swagger information.
     *
     * Specifies a specific {@link IHubSaleUnit unit} and
     * {@link IHubSaleUnitStock stock} from the target {@link IHubSale listing},
     * and retrieves its {@link OpenApi.IDocument Swagger} information.
     *
     * The returned Swagger document contains the actual server API address
     * registered by the seller based on the {@link IHubSeller seller} and
     * {@link IHubAdministrator administrator}, and the middleware API address of
     * this hub system for the DEV server based on the {@link IHubCustomer customer}.
     * For commercial purposes, the REAL server address is excluded.
     *
     * @param id {@link IHubSale.id} of the target listing
     * @param input Identifier key for the target unit (and stock)
     * @returns Swagger information
     *
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Patch(":id/swagger")
    public swagger(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleUnitSwaggerAccessor,
    ): Promise<OpenApi.IDocument> {
      return HubSaleProvider.swagger({
        actor,
        id,
        input,
      });
    }
  }
  return HubSaleController;
}
