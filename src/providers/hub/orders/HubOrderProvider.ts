import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubCartCommodityErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubCartCommodityErrorCode";
import { HubOrderGoodErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodErrorCode";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubSaleSnapshotProvider } from "../sales/HubSaleSnapshotProvider";
import { HubCartCommodityProvider } from "./HubCartCommodityProvider";
import { HubOrderGoodProvider } from "./HubOrderGoodProvider";
import { HubOrderPublishProvider } from "./HubOrderPublishProvider";

export namespace HubOrderProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = async (
      input: Prisma.hub_ordersGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubOrder> => ({
      ...invert.transform(input),
      goods: await Promise.all(
        input.goods
          .sort((a, b) => a.sequence - b.sequence)
          .map((records) =>
            HubOrderGoodProvider.json.transform(records, lang_code),
          ),
      ),
      price: {
        value: input.mv_price!.value,
        deposit: input.mv_price!.deposit,
        ticket: input.mv_price!.ticket,
      },
    });
    export const select = (actor: IHubActorEntity | null) =>
      ({
        include: {
          ...invert.select().include,
          goods: {
            include: HubOrderGoodProvider.json.select(actor, "approved")
              .include,
            where:
              actor?.type === "seller"
                ? {
                    hub_seller_id: actor.id,
                  }
                : undefined,
          },
          mv_price: true,
        },
      }) satisfies Prisma.hub_ordersFindManyArgs;
  }

  export namespace invert {
    export const transform = (
      input: Prisma.hub_ordersGetPayload<ReturnType<typeof select>>,
    ): IHubOrder.IInvert => ({
      id: input.id,
      customer: HubCustomerProvider.json.transform(input.customer),
      publish: input.publish
        ? HubOrderPublishProvider.json.transform(input.publish)
        : null,
      created_at: input.created_at.toISOString(),
      cancelled_at: input.cancelled_at?.toISOString() ?? null,
    });
    export const select = () =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
          publish: HubOrderPublishProvider.json.select(),
        },
      }) satisfies Prisma.hub_ordersFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    input: IHubOrder.IRequest;
  }): Promise<IPage<IHubOrder>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_orders,
      payload: json.select(props.actor),
      transform: (records) => json.transform(records, langCode),
    })({
      where: {
        AND: [
          where(props.actor),
          ...(await search(props.input.search, langCode)),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_ordersFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    id: string;
  }): Promise<IHubOrder> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    const record = await HubGlobal.prisma.hub_orders.findFirstOrThrow({
      where: {
        id: props.id,
        ...where(props.actor),
      },
      ...json.select(props.actor),
    });
    return json.transform(record, langCode);
  };

  export const searchInvert = (
    input: Omit<IHubOrder.IRequest.ISearch, "sale"> | undefined,
  ) =>
    [
      ...(input?.from !== undefined
        ? [{ created_at: { gte: new Date(input.from) } }]
        : []),
      ...(input?.to !== undefined
        ? [{ created_at: { lte: new Date(input.to) } }]
        : []),
      ...(input?.published !== undefined
        ? [
            input.published === true
              ? { publish: { isNot: null } }
              : { publish: { is: null } },
          ]
        : []),
      ...(input?.expired !== undefined
        ? [
            input.expired === true
              ? {
                  goods: {
                    every: {
                      OR: [
                        { closed_at: null },
                        { closed_at: { lte: new Date() } },
                      ],
                    },
                  },
                }
              : {
                  goods: {
                    every: {
                      closed_at: { gt: new Date() },
                    },
                  },
                },
          ]
        : []),
    ] satisfies Prisma.hub_ordersWhereInput["AND"];

  const where = (actor: IHubActorEntity) =>
    (actor.type === "customer"
      ? {
          customer: HubCustomerProvider.where(actor),
          cancelled_at: null,
        }
      : actor.type === "seller"
        ? {
            goods: {
              some: {
                hub_seller_id: actor.id,
              },
            },
            publish: { isNot: null },
            cancelled_at: null,
          }
        : {
            customer: {
              hub_channel_id: actor.customer.channel.id,
            },
            publish: { isNot: null },
            cancelled_at: null,
          }) satisfies Prisma.hub_ordersWhereInput;

  const search = async (
    input: IHubOrder.IRequest.ISearch | undefined,
    lang_code: IHubCustomer.LanguageType,
  ) =>
    [
      ...searchInvert(input),
      ...(
        await HubSaleSnapshotProvider.search({
          accessor: "input.search.sale",
          langCode: lang_code,
          input: input?.sale,
        })
      ).map((snapshot) => ({
        goods: {
          some: {
            commodity: {
              snapshot,
            },
          },
        },
      })),
    ] satisfies Prisma.hub_ordersWhereInput["AND"];

  const orderBy = (
    key: IHubOrder.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "order.created_at"
      ? { created_at: value }
      : {
          publish: { created_at: value },
        }) satisfies Prisma.hub_ordersOrderByWithRelationInput;

  /* -----------------------------------------------------------
              WRITERS
          ----------------------------------------------------------- */
  export const create = async (props: {
    actor: IHubCustomer;
    input: IHubOrder.ICreate;
  }): Promise<IHubOrder> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    // FIND MATCHED COMMODITIES
    const commodities: IHubCartCommodity[] = await ArrayUtil.asyncMap(
      await HubGlobal.prisma.hub_cart_commodities.findMany({
        where: {
          id: {
            in: props.input.goods.map((good) => good.commodity_id),
          },
        },
        ...HubCartCommodityProvider.json.select(props.actor, "approved"),
      }),
    )((records) => HubCartCommodityProvider.json.transform(records, langCode));
    if (commodities.length !== props.input.goods.length)
      throw ErrorProvider.notFound({
        accessor: "input.goods[].commodity_id",
        code: HubCartCommodityErrorCode.NOT_FOUND,
        message: "Unable to find some commodities.",
      });

    // DO ARCHIVE
    const order = await HubGlobal.prisma.hub_orders.create({
      data: {
        id: v4(),
        customer: {
          connect: {
            id: props.actor.id,
          },
        },
        ...(props.actor.member === null
          ? undefined
          : {
              member: {
                connect: {
                  id: props.actor.member.id,
                },
              },
            }),
        goods: {
          create: props.input.goods.map((raw, i) => {
            const commodity: IHubCartCommodity | undefined = commodities.find(
              (c) => c.id === raw.commodity_id,
            );
            if (commodity === undefined)
              throw ErrorProvider.internal({
                code: HubCartCommodityErrorCode.NOT_FOUND,
                message: "Unable to find commodity of matched sale.",
              });
            const sellerId: string = commodity.sale.seller.id;
            return HubOrderGoodProvider.collect({
              seller: { id: sellerId },
              commodity,
              input: raw,
              sequence: i,
            });
          }),
        },
        mv_price: {
          create: {
            value: commodities
              .map((c) => c.sale.units.map((u) => u.stock.price.fixed.deposit))
              .flat()
              .reduce((a, b) => a + b, 0),
            deposit: commodities
              .map((c) => c.sale.units.map((u) => u.stock.price.fixed.deposit))
              .flat()
              .reduce((a, b) => a + b, 0),
            ticket: 0,
          },
        },
        created_at: new Date(),
        cancelled_at: null,
      },
      ...json.select(props.actor),
    });
    return json.transform(order, langCode);
  };

  export const erase = async (props: {
    actor: IHubCustomer;
    id: string;
  }): Promise<void> => {
    const order = await HubGlobal.prisma.hub_orders.findFirstOrThrow({
      where: {
        id: props.id,
        customer: HubCustomerProvider.where(props.actor),
        cancelled_at: null,
      },
      include: {
        coupon_ticket_payments: {
          select: {
            hub_coupon_ticket_id: true,
          },
        },
        publish: true,
        goods: true,
      },
    });
    if (
      order.publish !== null &&
      order.goods.some(
        (good) =>
          good.opened_at !== null &&
          new Date(good.opened_at).getTime() < Date.now(),
      )
    )
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubOrderGoodErrorCode.OPENED,
        message:
          "Unable to erase published order which has some good that has opened.",
      });

    await HubGlobal.prisma.hub_orders.update({
      where: { id: props.id },
      data: {
        cancelled_at: new Date(),
      },
    });
    if (order.coupon_ticket_payments.length)
      await HubGlobal.prisma.hub_coupon_ticket_payments.deleteMany({
        where: {
          id: {
            in: order.coupon_ticket_payments.map(
              (ctp) => ctp.hub_coupon_ticket_id,
            ),
          },
        },
      });
  };
}
