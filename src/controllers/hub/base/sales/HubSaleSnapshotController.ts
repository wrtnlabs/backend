import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { OpenApi } from "@samchon/openapi";
import "@wrtnlabs/schema";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleUnitSwaggerAccessor } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitSwaggerAccessor";

import { HubSaleSnapshotProvider } from "../../../../providers/hub/sales/HubSaleSnapshotProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubSaleSnapshotController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/sales/:saleId/snapshots`)
  class HubSaleSnapshotController {
    /**
     * Get a list of summary information of approved snapshots in a listing.
     *
     * For a specific {@link IHubSale listing}, retrieve
     * {@link IHubSaleSnapshot.ISummary summary information} of all snapshots that
     * have been {@link IHubSaleAuditApproval audit approved} past and present.
     *
     * And at this time, the recorded statistics/aggregation information is
     * only written for the snapshot time. For example,
     * {@link IHubSaleGoodAggregate.call_count}, which means the total number of
     * API calls, is written for the snapshot time, not the total number of calls
     * for the listing.
     *
     * @param saleId {@link IHubSale.id} of the listing
     * @param input page request information
     * @returns List of snapshot summary information grouped by page
     *
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IPage.IRequest,
    ): Promise<IPage<IHubSaleSnapshot.ISummary>> {
      return HubSaleSnapshotProvider.index({
        actor,
        sale: { id: saleId },
        input,
      });
    }

    /**
     * View details of approved snapshots in Mem.
     *
     * View {@link IHubSaleSnapshot snapshot} of a specific time period that
     * has been {@link IHubSaleAuditApproval} approved for review within
     * {@link IHubSale listing}.
     *
     * However, if the listing is in {@link IHubSaleAudit review} and is in the
     * {@link IHubSaleAuditEmendation revision} process, then
     * {@link IHubSeller sellers} and {@link IHubAdministrator administrators}
     * can view it even if the review has not been approved.
     *
     * And at this time, the recorded statistics/aggregation information is only
     * for the snapshot time. For example, {@link IHubSaleGoodAggregate.call_count}
     * which means the total number of API calls, the total number of calls for
     * the snapshot time is recorded, not the total number of calls for the listing.
     *
     * @param saleId {@link IHubSale.id} of the listing
     * @param id {@link IHubSaleSnapshot.id} of the target snapshot
     * @returns snapshot details
     *
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubSaleSnapshot> {
      return HubSaleSnapshotProvider.at({
        actor,
        sale: { id: saleId },
        id,
      });
    }

    /**
     * Retrieve listing information for approved snapshots within listings.
     *
     * Retrieve information for {@link IHubSaleSnapshot snapshot} of a specific
     * time period that has been {@link IHubSaleAuditApproval} approved for review,
     * and retrieve listing information {@link IHubSale} at that time.
     *
     * However, if the listing is in {@link IHubSaleAudit review} and in the
     * {@link IHubSaleAuditEmendation emendation} process, then
     * {@link IHubSeller sellers} and {@link IHubAdministrator administrators} can
     * retrieve it, even if the review has not been approved.
     *
     * And at this time, the recorded statistics/aggregation information is only for
     * the time period of the snapshot. For example, in the case of
     * {@link IHubSaleGoodAggregate.call_count}, which means the total number of API
     * calls, the total number of calls for the snapshot is recorded, not the total
     * number of calls for the attributed property.
     *
     * @param saleId {@link IHubSale.id} of the attributed property
     * @param id {@link IHubSaleSnapshot.id} of the target snapshot
     * @returns property information reverse-constructed from the snapshot
     *
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Get(":id/flip")
    public flip(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubSale> {
      return HubSaleSnapshotProvider.detail({
        actor,
        sale: { id: saleId },
        id,
      });
    }

    /**
     * Retrieve Swagger information.
     *
     * Specify a specific {@link IHubSaleUnit unit} and
     * {@link IHubSaleUnitStock stock} from the target
     * {@link IHubSaleSnapshot listing snapshot}, and retrieve its
     * {@link OpenApi.IDocument Swagger} information.
     *
     * The returned Swagger document contains the actual server API address
     * registered by the seller based on {@link IHubSeller seller} and
     * {@link IHubAdministrator administrator}, and the middleware API address of
     * this hub system for the DEV server based on {@link IHubCustomer customer}.
     * For commercial purposes, the REAL server address is excluded.
     *
     * The Swagger document is translated and provided based on
     * {@link IHubCustomer.LanguageType language code}. In addition, the
     * corresponding swagger document is provided based on information about the
     * {@link IHubSaleUnit unit} and {@link IHubSaleUnitStock stock} specified by
     * {@link IHubSaleUnitSwaggerAccessor}.
     *
     * @param saleId {@link IHubSale.id} of the property being sold
     * @param id {@link IHubSaleSnapshot.id} of the target snapshot
     * @param input Identifier key for the target unit (and stock)
     * @returns swagger information
     *
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Patch(":id/swagger")
    public swagger(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleUnitSwaggerAccessor,
    ): Promise<OpenApi.IDocument> {
      return HubSaleSnapshotProvider.swagger({
        actor,
        sale: { id: saleId },
        id,
        input,
      });
    }
  }
  return HubSaleSnapshotController;
}
