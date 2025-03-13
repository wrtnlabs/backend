import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";

import { HubGlobal } from "../../../../HubGlobal";
import { HubCustomerProvider } from "../../actors/HubCustomerProvider";
import { HubSaleSnapshotProvider } from "../HubSaleSnapshotProvider";

export namespace HubSaleViewProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          snapshot: HubSaleSnapshotProvider.json.select(null),
          customer: HubCustomerProvider.json.select(),
        },
      }) satisfies Prisma.hub_sale_snapshot_view_historiesFindManyArgs;
  }

  export const create = async (props: {
    customer: IHubCustomer;
    snapshot: IEntity;
  }) => {
    await HubGlobal.prisma.hub_sale_snapshot_view_histories.create({
      data: collect(props),
    });
  };

  const collect = (props: { customer: IHubCustomer; snapshot: IEntity }) =>
    ({
      id: v4(),
      customer: {
        connect: {
          id: props.customer.id,
        },
      },
      ...(props.customer.member === null
        ? undefined
        : {
            member: {
              connect: {
                id: props.customer.member.id,
              },
            },
          }),
      snapshot: {
        connect: {
          id: props.snapshot.id,
        },
      },
      created_at: new Date(),
    }) satisfies Prisma.hub_sale_snapshot_view_historiesCreateInput;
}
