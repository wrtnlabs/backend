import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSaleUnitParameter } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitParameter";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";

export namespace HubSaleSnapshotUnitParameterProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_snapshot_unit_parametersGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleUnitParameter => ({
      id: input.id,
      in: input.in as "header",
      key: input.key,
      value: input.value,
      description: input.description,
      created_at: input.created_at.toISOString(),
      updated_at: input.updated_at.toISOString(),
    });
    export const select = () =>
      ({}) satisfies Prisma.hub_sale_snapshot_unit_parametersFindManyArgs;
  }

  export const index = async (props: {
    seller: IHubSeller.IInvert;
    sale: IEntity;
    snapshot: IEntity;
    unit: IEntity;
    input: IPage.IRequest;
  }): Promise<IPage<IHubSaleUnitParameter>> => {
    await findUnit(props);
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sale_snapshot_unit_parameters,
      transform: json.transform,
      payload: json.select(),
    })({
      where: {
        hub_sale_snapshot_unit_id: props.unit.id,
        deleted_at: null,
      },
      orderBy: [
        {
          sequence: "asc",
        },
        {
          created_at: "asc",
        },
      ],
    } satisfies Prisma.hub_sale_snapshot_unit_parametersFindManyArgs)(
      props.input,
    );
  };

  export const all = async (
    unit: IEntity,
  ): Promise<IHubSaleUnitParameter[]> => {
    const records =
      await HubGlobal.prisma.hub_sale_snapshot_unit_parameters.findMany({
        where: {
          hub_sale_snapshot_unit_id: unit.id,
          deleted_at: null,
        },
        orderBy: [
          {
            sequence: "asc",
          },
          {
            created_at: "asc",
          },
        ],
      });
    return records.map(json.transform);
  };

  export const at = async (props: {
    seller: IHubSeller.IInvert;
    sale: IEntity;
    snapshot: IEntity;
    unit: IEntity;
    id: string;
  }): Promise<IHubSaleUnitParameter> => {
    const record = await find({
      ...props,
      payload: json.select(),
    });
    return json.transform(record);
  };

  export const create = async (props: {
    seller: IHubSeller.IInvert;
    sale: IEntity;
    snapshot: IEntity;
    unit: IEntity;
    input: IHubSaleUnitParameter.ICreate;
  }): Promise<IHubSaleUnitParameter> => {
    await findUnit(props);
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_unit_parameters.create({
        data: {
          id: v4(),
          in: props.input.in,
          key: props.input.key,
          value: props.input.value,
          description: props.input.description,
          unit: {
            connect: {
              id: props.unit.id,
            },
          },
          sequence: 999_999,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
        ...json.select(),
      });
    return json.transform(record);
  };

  export const update = async (props: {
    seller: IHubSeller.IInvert;
    sale: IEntity;
    snapshot: IEntity;
    unit: IEntity;
    id: string;
    input: IHubSaleUnitParameter.IUpdate;
  }): Promise<void> => {
    await findUnit(props);
    await HubGlobal.prisma.hub_sale_snapshot_unit_parameters.update({
      where: {
        id: props.id,
      },
      data: {
        value: props.input.value,
        description: props.input.description,
        updated_at: new Date(),
      },
    });
  };

  export const erase = async (props: {
    seller: IHubSeller.IInvert;
    sale: IEntity;
    snapshot: IEntity;
    unit: IEntity;
    id: string;
  }): Promise<void> => {
    await find({
      ...props,
      payload: {},
    });
    await HubGlobal.prisma.hub_sale_snapshot_unit_parameters.update({
      where: {
        id: props.id,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  };

  const find = async <
    Payload extends Prisma.hub_sale_snapshot_unit_parametersFindManyArgs,
  >(props: {
    payload: Payload;
    seller: IHubSeller.IInvert;
    sale: IEntity;
    snapshot: IEntity;
    unit: IEntity;
    id: string;
  }) => {
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_unit_parameters.findFirstOrThrow(
        {
          where: {
            id: props.id,
            unit: {
              id: props.unit.id,
              snapshot: {
                id: props.snapshot.id,
                sale: {
                  id: props.sale.id,
                  customer: {
                    member: {
                      seller: {
                        id: props.seller.id,
                      },
                    },
                  },
                },
              },
            },
            deleted_at: null,
          },
          ...props.payload,
        },
      );
    return record as Prisma.hub_sale_snapshot_unit_parametersGetPayload<Payload>;
  };

  const findUnit = async (props: {
    seller: IHubSeller.IInvert;
    sale: IEntity;
    snapshot: IEntity;
    unit: IEntity;
  }): Promise<void> => {
    await HubGlobal.prisma.hub_sale_snapshot_units.findFirstOrThrow({
      where: {
        id: props.unit.id,
        snapshot: {
          id: props.snapshot.id,
          sale: {
            id: props.sale.id,
            member: {
              seller: {
                id: props.seller.id,
              },
            },
          },
        },
      },
    });
  };
}
