import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleAudit } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAudit";
import { IHubSaleAuditEmendation } from "@wrtnlabs/os-api/lib/structures/hub/sales/audits/IHubSaleAuditEmendation";

import { HubSaleAuditEmentationProvider } from "../../../../providers/hub/sales/audits/HubSaleAuditEmentationProvider";
import { HubSaleAuditProvider } from "../../../../providers/hub/sales/audits/HubSaleAuditProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubSaleAuditController<
  Actor extends IHubSeller.IInvert | IHubAdministrator.IInvert,
>(props: IHubControllerProps<"admins" | "sellers">) {
  @Controller(`hub/${props.path}/sales/:saleId/audits`)
  class HubSaleAuditController {
    /**
     * View audit information details.
     *
     * View {@link IHubSaleAudit audit post} for {@link IHubSale listing} in detail.
     *
     * The returned information {@link IHubSaleAudit} contains information such as
     * which {@link IHubAdministrator administrator} initiated the audit, and who
     * {@link IHubSaleAuditRejection rejected} or
     * {@link IHubSaleAuditApproval approved}, along with the respective dates and
     * times.
     *
     * In addition, {@link IHubSeller seller} and administrator can communicate
     * about the audit using {@link IHubSaleAuditComment comments}, so please also
     * call the comment-related API {@link audits.comments.index}.
     *
     * @param saleId {@link IHubSale.id} of the listing
     * @param id {@link IHubSaleAudit.id} of the audit target
     * @returns audit information
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubSaleAudit> {
      return HubSaleAuditProvider.at({
        actor,
        sale: { id: saleId },
        id,
      });
    }

    /**
     * Edit during review.
     *
     * If a {@link IHubSeller seller} registered (or modified)
     * {@link IHubSale listing} is currently under {@link IHubSaleAudit review},
     * the seller and the {@link IHubAdministrator administrator} can edit and
     * add to it.
     *
     * Of course, this is limited to listings that are undergoing review, and
     * listings that have not even started review yet cannot be edited. Also, listings
     * that have {@link IHubSaleAuditApproval approval} completed cannot be edited.
     *
     * However, for listings that have been {@link IHubSaleAuditRejection rejected}
     * by the administrator, the seller can request a retrial by editing it. Of course,
     * this is limited to
     * {@link IHubSaleAuditRejection.reversible reversible rejections}.
     *
     * @param saleId {@link IHubSale.id} of the target listing
     * @param id {@link IHubSaleAudit.id} of the target audit
     * @param input Editing content
     * @returns Editing completion information
     * @author Samchon
     * @tag Sale
     */
    @core.TypedRoute.Put(":id/emend")
    public emend(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
      @core.TypedBody() input: IHubSaleAuditEmendation.ICreate,
    ): Promise<IHubSaleAuditEmendation> {
      return HubSaleAuditEmentationProvider.create({
        actor,
        sale: { id: saleId },
        audit: { id },
        input,
      });
    }
  }
  return HubSaleAuditController;
}
