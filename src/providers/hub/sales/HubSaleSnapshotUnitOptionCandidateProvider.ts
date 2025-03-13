import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IHubSaleUnitOptionCandidate } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitOptionCandidate";

export namespace HubSaleSnapshotUnitOptionCandidateProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_snapshot_unit_option_candidatesGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleUnitOptionCandidate => ({
      id: input.id,
      name: input.name,
    });
    export const select = () =>
      ({}) satisfies Prisma.hub_sale_snapshot_unit_option_candidatesFindManyArgs;
  }

  export const collect = (props: {
    input: IHubSaleUnitOptionCandidate.ICreate;
    sequence: number;
  }) =>
    ({
      id: v4(),
      name: props.input.name,
      sequence: props.sequence,
    }) satisfies Prisma.hub_sale_snapshot_unit_option_candidatesCreateWithoutOptionInput;
}
