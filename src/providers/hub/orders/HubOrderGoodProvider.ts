import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubOrderPublishErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderPublishErrorCode";
import { HubOrderGoodDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubSaleProvider } from "../sales/HubSaleProvider";
import { HubSaleSnapshotProvider } from "../sales/HubSaleSnapshotProvider";
import { HubCartCommodityProvider } from "./HubCartCommodityProvider";
import { HubOrderProvider } from "./HubOrderProvider";

export namespace HubOrderGoodProvider {
  /* -----------------------------------------------------------
      TRANSFORMERS
    ----------------------------------------------------------- */
  export namespace json {
    export const transform = async (
      input: Prisma.hub_order_goodsGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubOrderGood> => {
      const good: IHubOrderGood = {
        id: input.id,
        commodity: await HubCartCommodityProvider.json.transform(
          input.commodity,
          lang_code,
        ),
        price: {
          value: input.mv_price!.value,
          deposit: input.mv_price!.deposit,
          ticket: input.mv_price!.ticket,
        },
        opened_at: input.opened_at?.toISOString() ?? null,
        closed_at: input.closed_at?.toISOString() ?? null,
      };
      for (const price of input.mv_hub_order_good_unit_prices) {
        const unit = good.commodity.sale.units.find(
          (u) => u.id === price.hub_sale_snapshot_unit_id,
        );
        if (unit === undefined) continue;

        unit.stock.price.fixed.ticket = price.fixed_ticket;
        unit.stock.price.variable.ticket = price.variable_ticket;
        for (const p of [unit.stock.price.fixed, unit.stock.price.variable])
          p.deposit = p.value - p.ticket;
      }
      return good;
    };

    export const select = (
      actor: IHubActorEntity | null,
      state: "last" | "approved",
    ) =>
      ({
        include: {
          commodity: HubCartCommodityProvider.json.select(actor, state),
          mv_price: true,
          mv_hub_order_good_unit_prices: true,
        },
      }) satisfies Prisma.hub_order_goodsFindManyArgs;
  }

  export namespace invert {
    export const transform = async (
      input: Prisma.hub_order_goodsGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubOrderGood.IInvert> => ({
      ...(await json.transform(input, lang_code)),
      order: HubOrderProvider.invert.transform(input.order),
    });
    export const select = (
      actor: IHubActorEntity | null,
      state: "last" | "approved",
    ) =>
      ({
        include: {
          ...json.select(actor, state).include,
          order: HubOrderProvider.invert.select(),
        },
      }) satisfies Prisma.hub_order_goodsFindManyArgs;
  }

  /* -----------------------------------------------------------
      READERS
    ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    order: IEntity | null;
    input: IHubOrderGood.IRequest;
  }): Promise<IPage<IHubOrderGood.IInvert>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_order_goods,
      payload: invert.select(
        props.actor,
        props.actor.type === "customer" ? "approved" : "last",
      ),
      transform: (records) => invert.transform(records, langCode),
    })({
      where: {
        AND: [...where(props), ...(await search(props.input.search, langCode))],
      },
      orderBy: [
        {
          order: { created_at: "desc" },
        },
        { sequence: "asc" },
      ],
    } satisfies Prisma.hub_order_goodsFindManyArgs)(props.input);
  };

  export const where = (props: {
    actor: IHubActorEntity;
    order: IEntity | null;
  }) =>
    [
      props.actor.type === "administrator"
        ? {}
        : props.actor.type === "customer"
          ? {
              order: {
                customer: HubCustomerProvider.where(props.actor),
              },
            }
          : { hub_seller_id: props.actor.id },
      ...(props.order !== null ? [{ hub_order_id: props.order.id }] : []),
    ] satisfies Prisma.hub_order_goodsWhereInput["AND"];

  export const orderBy = (
    key: IHubOrderGood.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "order.created_at"
      ? { order: { created_at: value } }
      : key === "order.publish.created_at"
        ? {
            order: {
              publish: {
                created_at: value,
              },
            },
          }
        : key === "good.opened_at"
          ? {
              opened_at: value,
            }
          : key === "good.closed_at"
            ? { closed_at: value }
            : {
                commodity: {
                  snapshot: {
                    sale: HubSaleProvider.orderBy(key, value),
                  },
                },
              }) satisfies Prisma.hub_order_goodsOrderByWithRelationInput;

  export const at = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    id: string;
  }): Promise<IHubOrderGood.IInvert> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    const record = await HubGlobal.prisma.hub_order_goods.findFirstOrThrow({
      where: {
        id: props.id,
        hub_seller_id:
          props.actor.type === "seller" ? props.actor.id : undefined,
        order:
          props.actor.member === null
            ? {
                id: props.order.id,
                customer: HubCustomerProvider.where(props.actor),
              }
            : {
                id: props.order.id,
              },
      },
      ...invert.select(
        props.actor,
        props.actor.type === "customer" ? "approved" : "last",
      ),
    });
    return invert.transform(record, langCode);
  };

  export const find = async <
    Payload extends Prisma.hub_order_goodsFindFirstOrThrowArgs,
  >(props: {
    payload: Payload;
    actor: IHubActorEntity | null;
    order: IEntity;
    id: string;
  }) => {
    const record = await HubGlobal.prisma.hub_order_goods.findFirstOrThrow({
      ...props.payload,
      where: {
        id: props.id,
        hub_seller_id:
          props.actor?.type === "seller" ? props.actor.id : undefined,
        order: {
          id: props.order.id,
          customer:
            props.actor?.type === "customer"
              ? HubCustomerProvider.where(props.actor)
              : undefined,
        },
      },
    });
    return record as Prisma.hub_order_goodsGetPayload<Payload>;
  };

  export const search = async (
    input: IHubOrderGood.IRequest.ISearch | undefined,
    lang_code: IHubCustomer.LanguageType,
  ) =>
    [
      ...HubOrderProvider.searchInvert(input?.order).map((order) => ({
        order,
      })),
      ...(
        await HubSaleSnapshotProvider.search({
          accessor: "input.search.sale",
          langCode: lang_code,
          input: input?.sale,
        })
      ).map((snapshot) => ({
        commodity: {
          snapshot,
        },
      })),
    ] satisfies Prisma.hub_order_goodsWhereInput["AND"];

  export const whereInContract = (customer: IHubCustomer) =>
    [
      {
        order: {
          customer: HubCustomerProvider.where(customer),
          cancelled_at: null,
          publish: { isNot: null },
        },
        opened_at: {
          lte: new Date(Date.now() + 15_000),
        },
      },
      {
        OR: [
          {
            closed_at: null,
          },
          {
            closed_at: {
              gte: new Date(Date.now() - 15_000),
            },
          },
        ],
      },
    ] satisfies Prisma.hub_order_goodsWhereInput["AND"];

  /* -----------------------------------------------------------
    FIND BY SALE
  ----------------------------------------------------------- */
  export const getBySaleId = async (props: {
    customer: IHubCustomer;
    sale: IEntity;
  }): Promise<IHubOrderGood.IInvert> => {
    const record = await findBySaleId({
      payload: invert.select(props.customer, "approved"),
      customer: props.customer,
      sale: props.sale,
    });
    return invert.transform(
      record,
      LanguageUtil.getNonNullActorLanguage(props.customer),
    );
  };

  export const ownSale = async (props: {
    customer: IHubCustomer;
    sale: IEntity;
  }): Promise<boolean> => {
    try {
      await findBySaleId({
        payload: { select: { id: true } },
        customer: props.customer,
        sale: props.sale,
      });
      return true;
    } catch {
      return false;
    }
  };

  const findBySaleId = async <
    Payload extends Prisma.hub_order_goodsFindFirstOrThrowArgs,
  >(props: {
    payload: Payload;
    customer: IHubCustomer;
    sale: IEntity;
  }) => {
    const good = await HubGlobal.prisma.hub_order_goods.findFirstOrThrow({
      ...props.payload,
      where: {
        AND: [
          ...whereInContract(props.customer),
          {
            commodity: {
              snapshot: {
                hub_sale_id: props.sale.id,
              },
            },
          },
        ],
      },
    });
    return good as Prisma.hub_order_goodsGetPayload<Payload>;
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const collect = (props: {
    seller: IEntity;
    commodity: IHubCartCommodity;
    input: IHubOrderGood.ICreate;
    sequence: number;
  }) =>
    ({
      id: v4(),
      commodity: {
        connect: { id: props.input.commodity_id },
      },
      seller: {
        connect: { id: props.seller.id },
      },
      opened_at: null,
      closed_at: null,
      sequence: props.sequence,
      mv_snapshots: {
        create: [
          {
            hub_sale_snapshot_id: props.commodity.sale.snapshot_id,
            hub_sale_snapshot_origin_id: props.commodity.sale.snapshot_id,
          },
        ],
      },
      mv_units: {
        create: props.commodity.sale.units.map((u) => ({
          id: v4(),
          hub_sale_snapshot_id: props.commodity.sale.snapshot_id,
          hub_sale_snapshot_unit_id: u.id,
          hub_sale_snapshot_unit_origin_id: u.id,
        })),
      },
      mv_price: {
        create: {
          // @todo DUPLICATED CODE
          value: props.commodity.sale.units
            .map((u) => u.stock.price.fixed.deposit)
            .reduce((a, b) => a + b, 0 as number),
          deposit: props.commodity.sale.units
            .map((u) => u.stock.price.fixed.deposit)
            .reduce((a, b) => a + b, 0 as number),
          ticket: 0,
        },
      },
      mv_hub_order_good_unit_prices: {
        create: props.commodity.sale.units
          .map((unit) => ({
            hub_sale_snapshot_unit_id: unit.id,
            hub_sale_snapshot_unit_stock_price_id: unit.stock.price.id,
            fixed_ticket: 0,
            variable_ticket: 0,
            count: 0,
          }))
          .flat(),
      },
    }) satisfies Prisma.hub_order_goodsCreateWithoutOrderInput;

  export const open = async (props: {
    customer: IHubCustomer;
    order: IEntity;
    id: string;
    input: IHubOrderGood.IOpen;
  }): Promise<void> => {
    const good = await updatable(props);
    const diagnoses: IDiagnosis[] = HubOrderGoodDiagnoser._Validate_open({
      current: () => "id",
      entity: "Good",
    })({
      opened_at: good.opened_at?.toISOString() ?? null,
      closed_at: good.closed_at?.toISOString() ?? null,
    })(props.input);
    if (diagnoses.length) throw ErrorProvider.unprocessable(diagnoses);

    await HubGlobal.prisma.hub_order_goods.update({
      where: { id: props.id },
      data: {
        opened_at:
          props.input.opened_at !== null
            ? props.input.opened_at === "now"
              ? new Date()
              : new Date(props.input.opened_at)
            : null,
      },
    });
  };

  export const close = async (props: {
    customer: IHubCustomer;
    order: IEntity;
    id: string;
    input: IHubOrderGood.IClose;
  }): Promise<void> => {
    const good = await updatable(props);
    const diagnoses: IDiagnosis[] = HubOrderGoodDiagnoser._Validate_close({
      current: () => "id",
      entity: "Good",
    })({
      opened_at: good.opened_at?.toISOString() ?? null,
      closed_at: good.closed_at?.toISOString() ?? null,
    })(props.input);
    if (diagnoses.length) throw ErrorProvider.unprocessable(diagnoses);

    await HubGlobal.prisma.hub_order_goods.update({
      where: { id: props.id },
      data: {
        closed_at:
          props.input.closed_at !== null
            ? new Date(props.input.closed_at)
            : null,
      },
    });
  };

  const updatable = async (props: {
    customer: IHubCustomer;
    order: IEntity;
    id: string;
  }) => {
    const good = await find({
      ...props,
      actor: props.customer,
      payload: {
        include: {
          order: {
            include: {
              publish: true,
            },
          },
        },
      },
    });
    if (good.order.publish === null)
      throw ErrorProvider.unprocessable({
        accessor: "orderId",
        code: HubOrderPublishErrorCode.NOT_CREATED,
        message: "Order has not been published yet.",
      });
    return good;
  };
}
