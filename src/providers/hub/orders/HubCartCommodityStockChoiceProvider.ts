import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IHubCartCommodityStockChoice } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodityStockChoice";
import { IHubSaleUnitOption } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitOption";
import { IHubSaleUnitStockChoice } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStockChoice";

import { HubSaleSnapshotUnitOptionCandidateProvider } from "../sales/HubSaleSnapshotUnitOptionCandidateProvider";

export namespace HubCartCommodityStockChoiceProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_cart_commodity_stock_choicesGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleUnitStockChoice.IInvert => {
      const option: IHubSaleUnitOption.IInvert =
        input.option.type === "select"
          ? {
              id: input.option.id,
              type: "select",
              name: input.option.name,
              variable: input.option.variable,
            }
          : {
              id: input.option.id,
              type: input.option.type as "string",
              name: input.option.name,
            };
      return {
        id: input.id,
        option:
          input.option.type === "select"
            ? {
                id: input.option.id,
                type: "select",
                name: input.option.name,
                variable: input.option.variable,
              }
            : {
                id: input.option.id,
                type: input.option.type as "string",
                name: input.option.name,
              },
        candidate:
          input.candidate !== null
            ? HubSaleSnapshotUnitOptionCandidateProvider.json.transform(
                input.candidate,
              )
            : null,
        value:
          option.type === "select"
            ? null
            : option.type === "boolean"
              ? input.value === "boolean"
              : option.type === "number"
                ? Number(input.value)
                : input.value,
      };
    };
    export const select = () =>
      ({
        include: {
          option: true,
          candidate: true,
        },
      }) satisfies Prisma.hub_cart_commodity_stock_choicesFindManyArgs;
  }

  export const collect = (
    input: IHubCartCommodityStockChoice.ICreate,
    sequence: number,
  ) =>
    ({
      id: v4(),
      option: {
        connect: { id: input.option_id },
      },
      candidate:
        input.candidate_id !== null
          ? { connect: { id: input.candidate_id } }
          : undefined,
      value: input.value !== null ? String(input.value) : null,
      sequence,
    }) satisfies Prisma.hub_cart_commodity_stock_choicesCreateWithoutStockInput;
}
