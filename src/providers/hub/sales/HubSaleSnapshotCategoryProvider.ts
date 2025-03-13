import { Prisma } from "@prisma/client";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

import { HubChannelCategoryProvider } from "../systematic/HubChannelCategoryProvider";

export namespace HubSaleSnapshotCategoryProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_snapshot_categoriesGetPayload<
        ReturnType<typeof HubSaleSnapshotCategoryProvider.json.select>
      >,
      langCode: IHubCustomer.LanguageType,
    ): Promise<IHubChannelCategory.IInvert> =>
      HubChannelCategoryProvider.invert({
        channel: { id: input.category.hub_channel_id },
        id: input.category.id,
        langCode,
      });
    export const select = () =>
      ({
        select: {
          category: {
            select: {
              id: true,
              hub_channel_id: true,
            },
          },
          sequence: true,
        },
      }) satisfies Prisma.hub_sale_snapshot_categoriesFindManyArgs;
  }
}
