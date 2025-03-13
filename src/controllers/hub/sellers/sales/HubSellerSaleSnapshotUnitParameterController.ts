import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleUnitParameter } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitParameter";

import { HubSaleSnapshotUnitParameterProvider } from "../../../../providers/hub/sales/HubSaleSnapshotUnitParameterProvider";

import { HubSellerAuth } from "../../../../decorators/HubSellerAuth";

@Controller(
  `hub/sellers/sales/:saleId/snapshots/:snapshotId/units/:unitId/parameters`,
)
export class HubSellerSaleSnapshotUnitParameterController {
  /**
   * Get parameter information for a listing.
   *
   * @param saleId {@link IHubSale.id} of the target listing
   * @param unitId {@link IHubSaleUnit.id} of the target unit
   * @return IHubSaleUnitParameter page information
   * @author Asher
   * @tag Sale
   */
  @core.TypedRoute.Patch()
  public index(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("snapshotId") snapshotId: string & tags.Format<"uuid">,
    @core.TypedParam("unitId") unitId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IPage.IRequest,
  ): Promise<IPage<IHubSaleUnitParameter>> {
    return HubSaleSnapshotUnitParameterProvider.index({
      seller,
      sale: { id: saleId },
      snapshot: { id: snapshotId },
      unit: { id: unitId },
      input,
    });
  }

  /**
   * Generate parameter information for the listing.
   *
   * @param saleId {@link IHubSale.id} of the target listing
   * @param unitId {@link IHubSaleUnit.id} of the target unit
   * @param input Parameter information to generate
   * @return Generated parameter information
   * @author Asher
   * @tag Sale
   */
  @core.TypedRoute.Post()
  public create(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("snapshotId") snapshotId: string & tags.Format<"uuid">,
    @core.TypedParam("unitId") unitId: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleUnitParameter.ICreate,
  ): Promise<IHubSaleUnitParameter> {
    return HubSaleSnapshotUnitParameterProvider.create({
      seller,
      sale: { id: saleId },
      snapshot: { id: snapshotId },
      unit: { id: unitId },
      input,
    });
  }

  /**
   * Modify specific parameter information for a listing.
   *
   * @param saleId {@link IHubSale.id} of the target listing
   * @param unitId {@link IHubSaleUnit.id} of the target unit
   * @param id parameter to modify {@link IHubSaleUnitParameter.id}
   * @param input parameter information to modify
   * @return modified parameter information
   *
   * @author Asher
   * @tag Sale
   */
  @core.TypedRoute.Put("/:id")
  public update(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("snapshotId") snapshotId: string & tags.Format<"uuid">,
    @core.TypedParam("unitId") unitId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSaleUnitParameter.IUpdate,
  ): Promise<void> {
    return HubSaleSnapshotUnitParameterProvider.update({
      seller,
      sale: { id: saleId },
      snapshot: { id: snapshotId },
      unit: { id: unitId },
      id,
      input,
    });
  }

  /**
   * Delete specific parameter information for a listing.
   *
   * @param saleId {@link IHubSale.id} of the target listing
   * @param unitId {@link IHubSaleUnit.id} of the target unit
   * @param id Parameter to delete {@link IHubSaleUnitParameter.id}
   *
   * @author Asher
   * @tag Sale
   */
  @core.TypedRoute.Delete("/:id")
  public erase(
    @HubSellerAuth() seller: IHubSeller.IInvert,
    @core.TypedParam("saleId") saleId: string & tags.Format<"uuid">,
    @core.TypedParam("snapshotId") snapshotId: string & tags.Format<"uuid">,
    @core.TypedParam("unitId") unitId: string & tags.Format<"uuid">,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return HubSaleSnapshotUnitParameterProvider.erase({
      seller,
      sale: { id: saleId },
      snapshot: { id: snapshotId },
      unit: { id: unitId },
      id,
    });
  }
}
