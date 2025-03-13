import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { Prisma } from "@prisma/client";
import { IHttpMigrateRoute } from "@samchon/openapi";
import typia from "typia";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubOrderGoodHistory } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGoodHistory";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";

export namespace HubOrderGoodHistoryProvider {
  export namespace json {
    export const select = () =>
      ({}) satisfies Prisma.hub_order_good_callsFindManyArgs;

    export const transform = (
      input: Prisma.hub_order_good_callsGetPayload<ReturnType<typeof select>>,
    ): IHubOrderGoodHistory => ({
      id: input.id,
      method: typia.assert<IHubOrderGoodHistory.MethodType>(
        input.method.toLowerCase(),
      ),
      arguments: decrypt(input.arguments),
      output: decrypt(input.output),
      path: input.path,
      status: input.status ?? null,
      created_at: input.created_at.toISOString(),
      responded_at: input.respond_at?.toISOString() ?? null,
    });
  }

  export namespace summary {
    export const select = () =>
      ({
        select: {
          id: true,
          status: true,
          created_at: true,
          respond_at: true,
        },
      }) satisfies Prisma.hub_order_good_callsFindManyArgs;

    export const transform = (
      input: Prisma.hub_order_good_callsGetPayload<ReturnType<typeof select>>,
    ): IHubOrderGoodHistory.ISummary => ({
      id: input.id,
      status: input.status ?? null,
      created_at: input.created_at.toISOString(),
      responded_at: input.respond_at?.toISOString() ?? null,
    });
  }

  export const index = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    input: IHubOrderGoodHistory.IRequest;
  }): Promise<IPage<IHubOrderGoodHistory.ISummary>> => {
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_order_good_calls,
      payload: summary.select(),
      transform: summary.transform,
    })({
      where: {
        AND: [
          {
            ...where(props),
          },
          ...search(props.input.search),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_order_good_callsFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    id: string;
  }): Promise<IHubOrderGoodHistory> => {
    const record = await HubGlobal.prisma.hub_order_good_calls.findFirstOrThrow(
      {
        where: {
          id: props.id,
          ...where(props),
        },
        ...json.select(),
      },
    );
    return json.transform(record);
  };

  const search = (input: IHubOrderGoodHistory.IRequest.ISearch | undefined) =>
    [
      ...(input?.unit_id !== undefined
        ? [
            {
              hub_sale_snapshot_unit_id: input.unit_id,
            },
          ]
        : []),
    ] satisfies Prisma.hub_order_good_callsWhereInput["AND"];

  const where = (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
  }) =>
    ({
      good: {
        id: props.good.id,
        order: {
          id: props.order.id,
          ...(props.actor.member === null
            ? { customer: HubCustomerProvider.where(props.actor) }
            : {
                member: {
                  id: props.actor.member.id,
                },
              }),
        },
      },
    }) satisfies Prisma.hub_order_good_callsWhereInput;

  const orderBy = (
    key: IHubOrderGoodHistory.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "history.created_at"
      ? { created_at: value }
      : {
          respond_at: value,
        }) satisfies Prisma.hub_order_good_callsOrderByWithRelationInput;

  export const create =
    (props: {
      good: IEntity;
      unit: IEntity;
      status: number | null;
      output: any | null;
      arguments: any | null;
      createAt: Date;
      respondAt: Date | null;
    }) =>
    async (route: IHttpMigrateRoute): Promise<IHubOrderGoodHistory> => {
      const record = await HubGlobal.prisma.hub_order_good_calls.create({
        data: {
          id: v4(),
          path: route.path,
          status: props.status,
          method: route.method.toLowerCase(),
          output: encrypt(props.output),
          arguments: encrypt(props.arguments),
          created_at: props.createAt,
          respond_at: props.respondAt,
          good: {
            connect: {
              id: props.good.id,
            },
          },
          unit: {
            connect: {
              id: props.unit.id,
            },
          },
        },
        ...json.select(),
      });

      return json.transform(record);
    };

  export const update = async (props: {
    history: IEntity;
    status: number | null;
    output: any | null;
    respondAt: Date | null;
  }): Promise<void> => {
    await HubGlobal.prisma.hub_order_good_calls.update({
      where: {
        id: props.history.id,
      },
      data: {
        output: encrypt(props.output),
        status: props.status,
        respond_at: props.respondAt,
      },
    });
  };
}

const encrypt = (input: any | null) =>
  input !== null && input !== undefined
    ? AesPkcs5.encrypt(
        JSON.stringify(input),
        HubGlobal.env.HUB_ORDER_GOOD_HISTORY_ENCRYPTION_KEY,
        HubGlobal.env.HUB_ORDER_GOOD_HISTORY_ENCRYPTION_IV,
      )
    : null;
const decrypt = (str: string | null): any =>
  str !== null
    ? JSON.parse(
        AesPkcs5.decrypt(
          str,
          HubGlobal.env.HUB_ORDER_GOOD_HISTORY_ENCRYPTION_KEY,
          HubGlobal.env.HUB_ORDER_GOOD_HISTORY_ENCRYPTION_IV,
        ),
      )
    : null;
