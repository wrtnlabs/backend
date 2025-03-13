import core from "@nestia/core";

import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSaleCollection } from "@wrtnlabs/os-api/lib/structures/hub/sales/collections/IHubSaleCollection";

import { HubSaleCollectionProvider } from "../../../../../providers/hub/sales/collections/HubSaleCollectionProvider";

import { HubAdminAuth } from "../../../../../decorators/HubAdminAuth";
import { HubSaleCollectionController } from "../../../base/sales/collections/HubSaleCollectionController";

export class HubAdminSaleCollectionController extends HubSaleCollectionController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {
  /**
   * Create a new collection.
   *
   * Create a new collection with the information provided by the administrator.
   *
   * @param input information for creating a new collection
   * @returns detailed information of the created collection
   * @author Asher
   * @tag Sale
   */
  @core.TypedRoute.Post()
  public create(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedBody() input: IHubSaleCollection.ICreate,
  ): Promise<IHubSaleCollection.IForAdmin> {
    return HubSaleCollectionProvider.create({
      admin,
      input,
    });
  }

  /**
   * Delete the collection.
   *
   * Delete the collection with the specified ID.
   *
   * @param id ID of the collection to delete
   * @returns nothing
   * @author Asher
   * @tag Sale
   */
  @core.TypedRoute.Delete(":id")
  async erase(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedParam("id") id: string,
  ): Promise<void> {
    await HubSaleCollectionProvider.erase(id);
  }

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
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedParam("id") id: string,
  ): Promise<IHubSaleCollection.IForAdmin> {
    return HubSaleCollectionProvider.atForAdmin({
      actor: admin,
      id,
    });
  }
}
