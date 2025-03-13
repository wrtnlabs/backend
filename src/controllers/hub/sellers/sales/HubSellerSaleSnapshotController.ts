// import core from "@nestia/core";
// import { tags } from "typia";
// import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
// import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
// import { HubSaleSnapshotProvider } from "../../../../providers/hub/sales/HubSaleSnapshotProvider";
import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";
import { HubSaleSnapshotController } from "../../base/sales/HubSaleSnapshotController";

export class HubSellerSaleSnapshotController extends HubSaleSnapshotController({
  path: "sellers",
  AuthGuard: HubSellerAuth,
}) {
  // /**
  //  * Change snapshot version description.
  //  *
  //  * Modify the version description {@link IHubSaleSnapshot.version_description}
  //  * written in the snapshot.
  //  *
  //  * @param saleId {@link IHubSale.id} of the property
  //  * @param id {@link IHubSaleSnapshot.id} of the target snapshot
  //  * @author Samchon
  //  *
  //  * @tag Sale
  //  */
  // @core.TypedRoute.Put(":id/version/description")
  // public description(
  //   @HubSellerAuth() seller: IHubSeller.IInvert,
  //   @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
  //   @core.TypedParam("id") id: string & tags.Format<"uuid">,
  //   @core.TypedBody() input: IHubSaleSnapshot.IUpdateVersionDescription,
  // ): Promise<void> {
  //   return HubSaleSnapshotProvider.updateVersionDescription(seller)({
  //     id: saleId,
  //   })(id)(input);
  // }
}
