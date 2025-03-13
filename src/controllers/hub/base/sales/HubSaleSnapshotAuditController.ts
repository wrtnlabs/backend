import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";

import { HubSaleSnapshotAuditProvider } from "../../../../providers/hub/sales/audits/HubSaleSnapshotAuditProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubSaleSnapshotAuditController<
  Actor extends IHubSeller.IInvert | IHubAdministrator.IInvert,
>(props: IHubControllerProps<"admins" | "sellers">) {
  @Controller(`hub/${props.path}/sales/:saleId/snapshots/audits`)
  class HubSaleSnapshotAuditController {
    /**
     * Get a list of audit information by snapshot of a listing.
     *
     * Load audit information by snapshot of the target listing
     * {@link IHubSaleAudit.ISummary}.
     *
     * @param saleId {@link IHubSale.id} of the target listing
     * @param input Page and search request information
     * @returns List of summary information of the paginated listings
     * @author Asher
     * @tag Sale
     */
    @core.TypedRoute.Patch()
    public async index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleAudit.IRequest,
    ): Promise<IPage<IHubSaleAudit.ISummary>> {
      return HubSaleSnapshotAuditProvider.index({
        actor,
        sale: { id: saleId },
        input,
      });
    }
  }

  return HubSaleSnapshotAuditController;
}
