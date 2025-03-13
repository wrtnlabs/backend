import core from "@nestia/core";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleCollection } from "@wrtnlabs/os-api/lib/structures/hub/sales/collections/IHubSaleCollection";

import { HubSaleCollectionProvider } from "../../../../../providers/hub/sales/collections/HubSaleCollectionProvider";

import { HubCustomerAuth } from "../../../../../decorators/HubCustomerAuth";
import { HubSaleCollectionController } from "../../../base/sales/collections/HubSaleCollectionController";

export class HubCustomerSaleCollectionController extends HubSaleCollectionController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * View detailed listings.
   *
   * View the target listing's detailed information {@link IHubSaleCollection}.
   *
   * @param id Target listing's {@link IHubSaleCollection.id}
   * @returns detailed information of the target listing
   * @author Asher
   * @tag Sale
   */
  @core.TypedRoute.Get(":id")
  async at(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("id") id: string,
  ): Promise<IHubSaleCollection> {
    return HubSaleCollectionProvider.at({
      actor: customer,
      id,
    });
  }
}
