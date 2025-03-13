import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IHubSaleUnitOption } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitOption";

import { HubSaleSnapshotUnitOptionCandidateProvider } from "./HubSaleSnapshotUnitOptionCandidateProvider";

export namespace HubsaleSnapshotUnitOptionProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_snapshot_unit_optionsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleUnitOption =>
      input.type === "select"
        ? {
            id: input.id,
            type: "select",
            variable: input.variable,
            name: input.name,
            candidates: input.candidates
              .sort((a, b) => a.sequence - b.sequence)
              .map(HubSaleSnapshotUnitOptionCandidateProvider.json.transform),
          }
        : {
            id: input.id,
            type: input.type as "string",
            name: input.name,
          };
    export const select = () =>
      ({
        include: {
          candidates: HubSaleSnapshotUnitOptionCandidateProvider.json.select(),
        },
      }) satisfies Prisma.hub_sale_snapshot_unit_optionsFindManyArgs;
  }

  export const collect = (props: {
    input: IHubSaleUnitOption.ICreate;
    sequence: number;
  }) =>
    ({
      id: v4(),
      name: props.input.name,
      type: props.input.type,
      variable: props.input.type === "select" ? props.input.variable : false,
      candidates:
        props.input.type === "select" && props.input.candidates.length
          ? {
              create:
                props.input.type === "select"
                  ? props.input.candidates.map((v, i) =>
                      HubSaleSnapshotUnitOptionCandidateProvider.collect({
                        input: v,
                        sequence: i,
                      }),
                    )
                  : [],
            }
          : undefined,
      sequence: props.sequence,
    }) satisfies Prisma.hub_sale_snapshot_unit_optionsCreateWithoutUnitInput;
}
