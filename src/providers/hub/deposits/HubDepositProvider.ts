import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubDepositErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubDepositErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubDeposit } from "@wrtnlabs/os-api/lib/structures/hub/deposits/IHubDeposit";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";

export namespace HubDepositProvider {
  /* -----------------------------------------------------------
              TRANSFORMERS
          ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_depositsGetPayload<ReturnType<typeof select>>,
    ): IHubDeposit => ({
      id: input.id,
      code: input.code,
      source: input.source,
      direction: input.direction as 1 | -1,
      created_at: input.created_at.toISOString(),
    });
    export const select = () => ({}) satisfies Prisma.hub_depositsFindManyArgs;
  }

  /* -----------------------------------------------------------
              READERS
          ----------------------------------------------------------- */
  export const index = (
    input: IHubDeposit.IRequest,
  ): Promise<IPage<IHubDeposit>> =>
    PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_deposits,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: search(input.search),
      },
      orderBy: input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(input.sort)
        : [
            {
              created_at: "desc",
            },
          ],
    } satisfies Prisma.hub_depositsFindManyArgs)(input);

  export const search = (input: IHubDeposit.IRequest.ISearch | undefined) =>
    [
      ...(input?.source?.length
        ? [
            {
              source: {
                contains: input.source,
              },
            },
          ]
        : []),
      ...(input?.code?.length
        ? [
            {
              code: {
                contains: input.code,
              },
            },
          ]
        : []),
      ...(input?.direction !== undefined
        ? [
            {
              direction: input.direction,
            },
          ]
        : []),
    ] satisfies Prisma.hub_depositsWhereInput["AND"];

  export const orderBy = (
    key: IHubDeposit.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "deposit.code"
      ? { code: value }
      : key === "deposit.source"
        ? { source: value }
        : {
            direction: value,
          }) satisfies Prisma.hub_depositsOrderByWithRelationInput;

  export const at = async (id: string): Promise<IHubDeposit> => {
    const record = await HubGlobal.prisma.hub_deposits.findFirstOrThrow({
      where: { id },
    });
    return json.transform(record);
  };

  export const get = async (code: string): Promise<IHubDeposit> => {
    const record = await HubGlobal.prisma.hub_deposits.findFirstOrThrow({
      where: { code },
    });
    return json.transform(record);
  };

  export const balance = async (citizen: IEntity): Promise<number> => {
    const record = await HubGlobal.prisma.mv_hub_deposit_balances.findFirst({
      where: {
        hub_citizen_id: citizen.id,
      },
    });
    return record?.value ?? 0;
  };

  /* -----------------------------------------------------------
              WRITERS
          ----------------------------------------------------------- */
  export const create = async (props: {
    admin: IHubAdministrator.IInvert | null;
    input: IHubDeposit.ICreate;
  }): Promise<IHubDeposit> => {
    const record = await HubGlobal.prisma.hub_deposits.create({
      data: collect(props),
      ...json.select(),
    });
    return json.transform(record);
  };

  export const erase = async (id: string): Promise<void> => {
    await HubGlobal.prisma.hub_deposits.findFirstOrThrow({
      where: { id },
    });

    const count: number = await HubGlobal.prisma.hub_deposit_histories.count({
      where: {
        hub_deposit_id: id,
      },
    });
    if (count !== 0)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubDepositErrorCode.ERASE_DENIED,
        message:
          "Cannot erase the deposit because it already has some histories.",
      });
    await HubGlobal.prisma.hub_deposits.delete({
      where: { id },
    });
  };

  const collect = (props: {
    admin: IHubAdministrator.IInvert | null;
    input: IHubDeposit.ICreate;
  }) =>
    ({
      id: v4(),
      customer: props.admin
        ? {
            connect: {
              id: props.admin.customer.id,
            },
          }
        : undefined,
      code: props.input.code,
      source: props.input.source,
      direction: props.input.direction,
      created_at: new Date(),
    }) satisfies Prisma.hub_depositsCreateInput;
}
