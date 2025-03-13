import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IHubSaleUnitStock } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitStock";

import { HubsaleSnapshotUnitOptionProvider } from "./HubSaleSnapshotUnitOptionProvider";

export namespace HubSaleSnapshotUnitStockProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_snapshot_unit_stocksGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleUnitStock => ({
      id: input.id,
      name: input.name,
      prices: input.prices.sort((a, b) => a.fixed - b.fixed),
      choices: input.choices
        .sort((a, b) => a.sequence - b.sequence)
        .map((c) => ({
          id: c.id,
          option_id: c.candidate.hub_sale_snapshot_unit_option_id,
          candidate_id: c.candidate.id,
        })),
    });
    export const select = () =>
      ({
        include: {
          prices: true,
          // to_routes: true,
          choices: {
            include: {
              candidate: true,
            },
          },
        },
      }) satisfies Prisma.hub_sale_snapshot_unit_stocksFindManyArgs;
  }

  export const collect = (props: {
    options: ReturnType<typeof HubsaleSnapshotUnitOptionProvider.collect>[];
    input: IHubSaleUnitStock.ICreate;
    sequence: number;
  }) =>
    ({
      id: v4(),
      name: props.input.name,
      choices: props.input.choices.length
        ? {
            create: props.input.choices.map((choice, j) => {
              const option = props.options[choice.option_index];
              const candidate =
                option.candidates!.create[choice.candidate_index];
              return {
                id: v4(),
                candidate: {
                  connect: { id: candidate.id },
                },
                sequence: j,
              };
            }),
          }
        : undefined,
      prices: props.input.prices.length
        ? {
            create: props.input.prices.map((price) => ({
              id: v4(),
              threshold: price.threshold,
              fixed: price.fixed,
              variable: price.variable,
            })),
          }
        : undefined,
      sequence: props.sequence,
    }) satisfies Prisma.hub_sale_snapshot_unit_stocksCreateWithoutUnitInput;
}
