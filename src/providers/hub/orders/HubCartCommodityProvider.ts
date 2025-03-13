import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubCartCommodityErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubCartCommodityErrorCode";
import { HubOrderPublishErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderPublishErrorCode";
import { HubCartCommodityDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/orders/HubCartCommodityDiagnoser";
import { HubCartDiscountableDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/orders/HubCartDiscountableDiagnoser";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubCartDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartDiscountable";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubCouponProvider } from "../coupons/HubCouponProvider";
import { HubCouponTicketProvider } from "../coupons/HubCouponTicketProvider";
import { HubDepositProvider } from "../deposits/HubDepositProvider";
import { HubSaleProvider } from "../sales/HubSaleProvider";
import { HubSaleSnapshotProvider } from "../sales/HubSaleSnapshotProvider";
import { HubCartCommodityStockProvider } from "./HubCartCommodityStockProvider";
import { HubCartProvider } from "./HubCartProvider";

export namespace HubCartCommodityProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = async (
      input: Prisma.hub_cart_commoditiesGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubCartCommodity> => ({
      id: input.id,
      sale: {
        ...(await HubSaleSnapshotProvider.invert.transform(
          input.snapshot,
          lang_code,
        )),
        units: await ArrayUtil.asyncMap(
          input.to_stocks.sort((a, b) => a.sequence - b.sequence),
        )((record) =>
          HubCartCommodityStockProvider.json.transform(record, lang_code),
        ),
      },
      pseudo: false,
      created_at: input.created_at.toISOString(),
    });
    export const select = (
      actor: IHubActorEntity | null,
      state: "last" | "approved",
    ) =>
      ({
        include: {
          snapshot: HubSaleSnapshotProvider.invert.select(actor, state),
          to_stocks: HubCartCommodityStockProvider.json.select(actor),
        },
      }) satisfies Prisma.hub_cart_commoditiesFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    customer: IHubCustomer;
    cart: IEntity | null;
    input: IHubCartCommodity.IRequest;
  }): Promise<IPage<IHubCartCommodity>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_cart_commodities,
      payload: json.select(props.customer, "approved"),
      transform: (records) => json.transform(records, langCode),
    })({
      where: {
        AND: [
          {
            cart: {
              id: props.cart?.id,
              customer: HubCustomerProvider.where(props.customer),
            },
            published: false,
            deleted_at: null,
          },
          ...(await search(props.input.search, langCode)),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_cart_commoditiesFindManyArgs)(props.input);
  };

  export const at = async (props: {
    customer: IHubCustomer;
    cart: IEntity | null;
    id: string;
  }): Promise<IHubCartCommodity> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);
    const record = await HubGlobal.prisma.hub_cart_commodities.findFirstOrThrow(
      {
        where: {
          id: props.id,
          cart: {
            id: props.cart?.id,
            customer: HubCustomerProvider.where(props.customer),
          },
          published: false,
          deleted_at: null,
        },
        ...json.select(props.customer, "approved"),
      },
    );
    return json.transform(record, langCode);
  };

  const search = async (
    input: IHubCartCommodity.IRequest.ISearch | undefined,
    lang_code: IHubCustomer.LanguageType,
  ) =>
    [
      ...(input?.sale !== undefined
        ? [
            ...(
              await HubSaleSnapshotProvider.search({
                accessor: "input.search.sale",
                langCode: lang_code,
                input: input.sale,
              })
            ).map((snapshot) => ({
              snapshot,
            })),
          ]
        : []),
    ] satisfies Prisma.hub_cart_commoditiesWhereInput["AND"];

  const orderBy = (
    key: IHubCartCommodity.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "commodity.created_at"
      ? { created_at: value }
      : {
          snapshot: HubSaleSnapshotProvider.orderBy(key, value),
        }) satisfies Prisma.hub_cart_commoditiesOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const discountable = async (props: {
    customer: IHubCustomer;
    cart: IEntity | null;
    input: IHubCartDiscountable.IRequest;
  }): Promise<IHubCartDiscountable> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);
    const commodities = await HubGlobal.prisma.hub_cart_commodities.findMany({
      where: {
        id:
          props.input.commodity_ids !== null
            ? {
                in: props.input.commodity_ids,
              }
            : undefined,
        cart: {
          id: props.cart?.id,
          customer: HubCustomerProvider.where(props.customer),
          actor_type: "customer",
        },
        published: false,
        deleted_at: null,
      },
      ...json.select(props.customer, "approved"),
    });
    if (
      props.input.commodity_ids !== null &&
      commodities.length !== props.input.commodity_ids.length
    )
      throw ErrorProvider.notFound({
        accessor: "input.commodity_ids",
        code: HubCartCommodityErrorCode.NOT_FOUND,
        message: "Some commodities are not found.",
      });
    const pseudos: IHubCartCommodity[] =
      props.input.pseudos.length === 0
        ? []
        : await ArrayUtil.asyncMap(props.input.pseudos)(async (raw) =>
            HubCartCommodityDiagnoser.preview(
              await HubSaleProvider.at({
                actor: props.customer,
                id: raw.sale_id,
                strict: true,
              }),
            )(raw),
          );

    return {
      deposit: props.customer.citizen
        ? await HubDepositProvider.balance(props.customer.citizen)
        : null,
      combinations: HubCartDiscountableDiagnoser.combine(props.customer)(
        await take((input) =>
          HubCouponProvider.index({
            actor: props.customer,
            input,
          }),
        ),
        props.customer.citizen
          ? await take((input) =>
              HubCouponTicketProvider.index({
                customer: props.customer,
                input,
              }),
            )
          : [],
      )([
        ...(await ArrayUtil.asyncMap(commodities)((records) =>
          json.transform(records, langCode),
        )),
        ...pseudos,
      ]),
    };
  };

  export const create = async (props: {
    customer: IHubCustomer;
    cart: IEntity | null;
    input: IHubCartCommodity.ICreate;
  }): Promise<IHubCartCommodity> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);

    const sale: IHubSale = await HubSaleProvider.at({
      actor: props.customer,
      strict: false,
      id: props.input.sale_id,
    });
    const diagnoses: IDiagnosis[] = HubCartCommodityDiagnoser.validate(sale)(
      props.input,
    );
    if (diagnoses.length > 0) throw ErrorProvider.unprocessable(diagnoses);

    const record = await HubGlobal.prisma.hub_cart_commodities.create({
      data: collect({
        cart: props.cart ?? (await HubCartProvider.emplace(props.customer)),
        sale,
        input: props.input,
      }),
      ...json.select(props.customer, "approved"),
    });
    return json.transform(record, langCode);
  };

  export const erase = async (props: {
    customer: IHubCustomer;
    cart: IEntity | null;
    id: string;
  }): Promise<void> => {
    const record = await HubGlobal.prisma.hub_cart_commodities.findFirstOrThrow(
      {
        where: {
          id: props.id,
          cart: {
            id: props.cart?.id,
            customer: HubCustomerProvider.where(props.customer),
          },
        },
      },
    );
    if (record.published === true)
      throw ErrorProvider.gone({
        code: HubOrderPublishErrorCode.CREATED,
        message: "Already published.",
      });
    await HubGlobal.prisma.hub_cart_commodities.update({
      where: { id: props.id },
      data: {
        deleted_at: new Date(),
      },
    });
  };

  export const replica = async (props: {
    customer: IHubCustomer;
    cart: IEntity | null;
    id: string;
  }): Promise<IHubCartCommodity.ICreate> => {
    const commodity = await at(props);
    return HubCartCommodityDiagnoser.replica(commodity);
  };

  const collect = (props: {
    cart: IEntity;
    sale: IHubSale;
    input: IHubCartCommodity.ICreate;
  }) =>
    ({
      id: v4(),
      cart: {
        connect: { id: props.cart.id },
      },
      snapshot: {
        connect: { id: props.sale.snapshot_id },
      },
      to_stocks: {
        create: props.input.stocks.map(HubCartCommodityStockProvider.collect),
      },
      created_at: new Date(),
      published: false,
    }) satisfies Prisma.hub_cart_commoditiesCreateInput;
}

const take = async <T extends object>(
  closure: (input: IPage.IRequest) => Promise<IPage<T>>,
): Promise<T[]> => {
  const page: IPage<T> = await closure({ limit: 0 });
  return page.data;
};
