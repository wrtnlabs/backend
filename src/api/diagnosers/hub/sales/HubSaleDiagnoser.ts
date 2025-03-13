import { OpenApi } from "@samchon/openapi";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { HubSaleSnapshotDiagnoser } from "./HubSaleSnapshotDiagnoser";

export namespace HubSaleDiagnoser {
  export const validate = (
    sale: IHubSale.ICreate,
    checkSnapshot: boolean = true,
  ): IDiagnosis[] => {
    const output: IDiagnosis[] = [];

    // PROPERTIES
    if (
      sale.opened_at &&
      sale.closed_at &&
      new Date(sale.closed_at).getTime() < new Date(sale.opened_at).getTime()
    )
      output.push({
        accessor: "input.closed_at",
        code: HubSaleErrorCode.NOT_CLOSEABLE,
        message: "Closed date is earlier than opened date",
      });

    // SNAPSHOT
    if (checkSnapshot === true)
      output.push(...HubSaleSnapshotDiagnoser.validate(sale));

    return output;
  };

  export interface IPreviewAsset {
    seller: IHubSeller.IInvert;
    section: IHubSection;
    channel: IHubChannel.IHierarchical;
    swagger: OpenApi.IDocument | null;
    connector_icon: string[] | null;
  }

  export const preview =
    (asset: IPreviewAsset) =>
    (input: IHubSale.ICreate): IHubSale => {
      if (asset.section.code !== input.section_code)
        throw new Error("Invalid section code");
      return {
        ...HubSaleSnapshotDiagnoser.preview(asset.connector_icon)(
          asset.channel,
        )(input),
        section: asset.section,
        seller: asset.seller,
        audit: null,
        created_at: new Date().toISOString(),
        opened_at: input.opened_at,
        closed_at: input.closed_at,
        paused_at: null,
        suspended_at: null,
        bookmarked_at: null,
      };
    };

  export const replica =
    (
      units: {
        unit_id: string;
        swagger: OpenApi.IDocument;
        contents: IHubSaleUnit.IUnitContent[];
      }[],
    ) =>
    (sale: IHubSale): IHubSale.ICreate => ({
      ...HubSaleSnapshotDiagnoser.replica(units)(sale, [sale.content]),
      section_code: sale.section.code,
      opened_at: sale.opened_at,
      closed_at: sale.closed_at,
    });

  export const readable =
    (accessor: string, checkPause: boolean) =>
    (sale: IHubSale): IDiagnosis[] => {
      const output: IDiagnosis[] = [];

      // OPENING TIME
      if (sale.opened_at === null)
        output.push({
          accessor,
          code: HubSaleErrorCode.NOT_OPENED,
          message: `The sale has not been opened.`,
        });
      else if (new Date(sale.opened_at).getTime() > Date.now())
        output.push({
          accessor,
          code: HubSaleErrorCode.NOT_OPENED,
          message: `The sale has not been opened yet.`,
        });

      // CLOSING OR STOPPING TIMES
      const timestamp =
        (status: string) =>
        (time: string | null) =>
        (code: HubSaleErrorCode) => {
          if (time !== null && Date.now() >= new Date(time).getTime())
            output.push({
              accessor,
              code: code,
              message: `The sale has been ${status}.`,
            });
        };
      timestamp("closed")(sale.closed_at)(HubSaleErrorCode.SALE_ALREADY_CLOSED);
      if (checkPause)
        timestamp("paused")(sale.paused_at)(
          HubSaleErrorCode.SALE_ALREADY_PAUSED,
        );
      timestamp("suspended")(sale.suspended_at)(
        HubSaleErrorCode.SALE_NOT_SUSPENDED,
      );

      return output;
    };
}
