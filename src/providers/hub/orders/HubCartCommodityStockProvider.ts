import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodityStock } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodityStock";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";

import { LanguageUtil } from "../../../utils/LanguageUtil";
import { HubSaleSnapshotUnitProvider } from "../sales/HubSaleSnapshotUnitProvider";
import { HubCartCommodityStockChoiceProvider } from "./HubCartCommodityStockChoiceProvider";

export namespace HubCartCommodityStockProvider {
  export namespace json {
    export const transform = async (
      input: Prisma.hub_cart_commodity_stocksGetPayload<
        ReturnType<typeof select>
      >,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubSaleUnit.IInvert> => ({
      ...(await HubSaleSnapshotUnitProvider.invert.transform(
        input.price.stock.unit,
        lang_code,
      )),
      stock: {
        id: input.price.stock.id,
        name: input.price.stock.name,
        choices: input.choices
          .sort((a, b) => a.sequence - b.sequence)
          .map((inter) =>
            HubCartCommodityStockChoiceProvider.json.transform(inter),
          ),
        price: {
          id: input.price.id,
          threshold: input.price.threshold,
          fixed: {
            value: input.price.fixed,
            deposit: input.price.fixed,
            ticket: 0,
          },
          variable: {
            value: input.price.variable,
            deposit: input.price.variable,
            ticket: 0,
          },
        },
      },
    });
    export const select = (actor: IHubActorEntity | null) =>
      ({
        include: {
          choices: HubCartCommodityStockChoiceProvider.json.select(),
          price: {
            include: {
              stock: {
                include: {
                  unit: HubSaleSnapshotUnitProvider.invert.select(
                    LanguageUtil.getNonNullActorLanguage(actor),
                  ),
                },
              },
            },
          },
        },
      }) satisfies Prisma.hub_cart_commodity_stocksFindManyArgs;
  }

  export const collect = (
    input: IHubCartCommodityStock.ICreate,
    sequence: number,
  ) =>
    ({
      id: v4(),
      choices: {
        create: input.choices.map(HubCartCommodityStockChoiceProvider.collect),
      },
      unit: {
        connect: { id: input.unit_id },
      },
      stock: {
        connect: { id: input.stock_id },
      },
      price: {
        connect: { id: input.price_id },
      },
      sequence,
    }) satisfies Prisma.hub_cart_commodity_stocksCreateWithoutCommodityInput;
}
