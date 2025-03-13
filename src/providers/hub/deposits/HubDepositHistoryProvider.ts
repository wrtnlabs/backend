import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { ICodeEntity } from "@wrtnlabs/os-api/lib/structures/common/ICodeEntity";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCitizen } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCitizen";
import { IHubDeposit } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDeposit";
import { IHubDepositHistory } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDepositHistory";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
// import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCitizenProvider } from "../actors/HubCitizenProvider";
import { HubDepositProvider } from "./HubDepositProvider";

export namespace HubDepositHistoryProvider {
  /* -----------------------------------------------------------
        TRANSFORMERS
    ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_deposit_historiesGetPayload<ReturnType<typeof select>>,
    ): IHubDepositHistory => ({
      id: input.id,
      citizen: HubCitizenProvider.json.transform(input.citizen),
      deposit: HubDepositProvider.json.transform(input.deposit),
      source_id: input.source_id,
      value: input.value,
      balance: input.balance,
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({
        include: {
          citizen: HubCitizenProvider.json.select(),
          deposit: HubDepositProvider.json.select(),
        },
      }) satisfies Prisma.hub_deposit_historiesFindManyArgs;
  }

  /* -----------------------------------------------------------
        READERS
    ----------------------------------------------------------- */
  export const index = async (props: {
    citizen: IHubCitizen;
    input: IHubDepositHistory.IRequest;
  }): Promise<IPage<IHubDepositHistory>> =>
    PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_deposit_histories,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: [
          { hub_citizen_id: props.citizen.id },
          ...search(props.input.search),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_deposit_historiesFindManyArgs)(props.input);

  const search = (input: IHubDepositHistory.IRequest.ISearch | undefined) =>
    [
      ...(input?.deposit !== undefined
        ? HubDepositProvider.search(input.deposit).map((deposit) => ({
            deposit,
          }))
        : []),
      ...(input?.citizen_id?.length
        ? [
            {
              hub_citizen_id: input.citizen_id,
            },
          ]
        : []),
      ...(input?.from?.length
        ? [
            {
              created_at: {
                gte: input.from,
              },
            },
          ]
        : []),
      ...(input?.to?.length
        ? [
            {
              created_at: {
                lte: input.to,
              },
            },
          ]
        : []),
      ...(input?.minimum !== undefined
        ? [
            {
              value: {
                gte: input.minimum,
              },
            },
          ]
        : []),
      ...(input?.maximum !== undefined
        ? [
            {
              value: {
                lte: input.maximum,
              },
            },
          ]
        : []),
    ] satisfies Prisma.hub_deposit_historiesWhereInput["AND"];

  const orderBy = (
    key: IHubDepositHistory.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "history.created_at"
      ? { created_at: value }
      : key === "history.value"
        ? { value: value }
        : {
            deposit: HubDepositProvider.orderBy(key, value),
          }) satisfies Prisma.hub_deposit_historiesOrderByWithRelationInput;

  export const at = async (props: {
    citizen: IHubCitizen;
    id: string;
  }): Promise<IHubDepositHistory> => {
    const record =
      await HubGlobal.prisma.hub_deposit_histories.findFirstOrThrow({
        where: {
          id: props.id,
          hub_citizen_id: props.citizen.id,
        },
        ...json.select(),
      });
    return json.transform(record);
  };

  /* -----------------------------------------------------------
        WRITERS
    ----------------------------------------------------------- */
  export const create = async (props: {
    citizen: IEntity;
    deposit: ICodeEntity;
    source: IEntity;
    value: number;
  }): Promise<void> => {
    await process({
      citizen: props.citizen,
      deposit: props.deposit,
      task: async () => props.source,
      source: (entity) => entity,
      value: props.value,
    });
  };

  export const process = async <T extends IEntity>(props: {
    citizen: IEntity;
    deposit: ICodeEntity;
    task: () => Promise<T>;
    source: (entity: T) => IEntity;
    value: number;
  }): Promise<T> => {
    const deposit: IHubDeposit = await HubDepositProvider.get(
      props.deposit.code,
    );
    const previous: number = await HubDepositProvider.balance(props.citizen);
    const increment: number = deposit.direction * props.value;
    const after: number = previous + increment;

    // if (after < 0)
    //     throw ErrorProvider.paymentRequired("not enough deposit");

    const entity: T = await props.task();
    const record = await HubGlobal.prisma.hub_deposit_histories.create({
      data: {
        id: v4(),
        deposit: {
          connect: { id: deposit.id },
        },
        citizen: {
          connect: { id: props.citizen.id },
        },
        source_id: props.source(entity).id,
        value: props.value,
        balance: previous,
        created_at: new Date(),
      } satisfies Prisma.hub_deposit_historiesCreateInput,
    });

    await HubGlobal.prisma.mv_hub_deposit_balances.upsert({
      where: {
        hub_citizen_id: props.citizen.id,
      },
      create: {
        hub_citizen_id: props.citizen.id,
        value: after,
      },
      update: {
        value: {
          increment,
        },
      },
    });
    await HubGlobal.prisma.hub_deposit_histories.updateMany({
      where: {
        hub_citizen_id: props.citizen.id,
        created_at: {
          gte: record.created_at,
        },
        cancelled_at: null,
      },
      data: {
        balance: {
          increment,
        },
      },
    });
    return entity;
  };

  export const cancel = async <T>(props: {
    citizen: IEntity;
    deposit: ICodeEntity;
    task: () => Promise<T>;
    source: (entity: T) => IEntity;
  }): Promise<T> => {
    const deposit: IHubDeposit = await HubDepositProvider.get(
      props.deposit.code,
    );
    const entity: T = await props.task();
    const history =
      await HubGlobal.prisma.hub_deposit_histories.findFirstOrThrow({
        where: {
          hub_deposit_id: deposit.id,
          source_id: props.source(entity).id,
          hub_citizen_id: props.citizen.id,
        },
      });
    await HubGlobal.prisma.hub_deposit_histories.update({
      where: {
        id: history.id,
      },
      data: {
        cancelled_at: new Date(),
      },
    });

    const decrement: number = deposit.direction * history.value;
    await HubGlobal.prisma.hub_deposit_histories.updateMany({
      where: {
        hub_citizen_id: props.citizen.id,
        created_at: {
          gte: history.created_at,
        },
      },
      data: {
        value: {
          decrement,
        },
      },
    });
    await HubGlobal.prisma.mv_hub_deposit_balances.update({
      where: {
        hub_citizen_id: props.citizen.id,
      },
      data: {
        value: {
          decrement,
        },
      },
    });
    return entity;
  };
}
