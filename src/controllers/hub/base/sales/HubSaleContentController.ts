import { TypedBody, TypedParam, TypedRoute } from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleContent } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleContent";

import { HubSaleSnapshotContentProvider } from "../../../../providers/hub/sales/HubSaleSnapshotContentProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubSaleContentController(props: IHubControllerProps) {
  @Controller(`hub/${props.path}/sales`)
  class HubSaleContentController {
    /**
     * List up every language contents of the sale.
     *
     * List up every language contents of the sale, with the pagination.
     *
     * @param saleId Target sale's {@link IHubSale.id}
     * @param input Request of page information
     * @returns Paginated contents of the sale
     * @tag Sale
     * @author Samchon
     */
    @TypedRoute.Patch(`:saleId/contents`)
    public index(
      @props.AuthGuard() actor: IHubActorEntity,
      @TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @TypedBody() input: IPage.IRequest,
    ): Promise<IPage<IHubSaleContent>> {
      return HubSaleSnapshotContentProvider.index({
        actor,
        sale: { id: saleId },
        snapshot: null,
        input,
      });
    }

    /**
     * Get a specific language's content.
     *
     * @param saleId Target sale's {@link IHubSale.id}
     * @param langCode Target language code
     * @returns Sale content of the specific language
     * @tag Sale
     * @author Samchon
     */
    @TypedRoute.Get(":saleId/contents/:langCode")
    public get(
      @props.AuthGuard() actor: IHubActorEntity,
      @TypedParam("saleId") saleId: string & tags.Format<"uuid">,
      @TypedParam("langCode") langCode: string,
    ): Promise<IHubSaleContent> {
      return HubSaleSnapshotContentProvider.get({
        actor,
        sale: { id: saleId },
        snapshot: null,
        langCode,
      });
    }
  }
  return HubSaleContentController;
}
