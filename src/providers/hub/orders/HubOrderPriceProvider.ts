import { ArrayUtil } from "@nestia/e2e";

import { HubCouponErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubCouponErrorCode";
import { HubOrderGoodErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodErrorCode";
import { HubOrderPublishErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderPublishErrorCode";
import { HubOrderDiscountableDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub";
import { HubCouponTicketDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/coupons/HubCouponTicketDiagnoser";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponTicket } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicket";
import { IHubCouponTicketPayment } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicketPayment";
import { IHubOrder } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrder";
import { IHubOrderDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderDiscountable";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubOrderPrice } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderPrice";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubCouponProvider } from "../coupons/HubCouponProvider";
import { HubCouponTicketPaymentProvider } from "../coupons/HubCouponTicketPaymentProvider";
import { HubCouponTicketProvider } from "../coupons/HubCouponTicketProvider";
import { HubDepositProvider } from "../deposits/HubDepositProvider";
import { HubOrderProvider } from "./HubOrderProvider";

export namespace HubOrderPriceProvider {
  export const get = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<IHubOrderPrice> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);
    await HubGlobal.prisma.hub_orders.findFirstOrThrow({
      where: {
        id: props.id,
        ...(props.customer.member === null
          ? {
              customer: HubCustomerProvider.where(props.customer),
            }
          : {
              hub_member_id: props.customer.member.id,
            }),
      },
    });
    const price = await HubGlobal.prisma.mv_hub_order_prices.findFirstOrThrow({
      where: {
        hub_order_id: props.id,
      },
    });

    const ticket_payments: IHubCouponTicketPayment[] = await ArrayUtil.asyncMap(
      await HubGlobal.prisma.hub_coupon_ticket_payments.findMany({
        where: {
          hub_order_id: props.id,
        },
        ...HubCouponTicketPaymentProvider.json.select(props.customer),
      }),
    )((records) =>
      HubCouponTicketPaymentProvider.json.transform(records, langCode),
    );
    return {
      value: price.value,
      deposit: price.deposit,
      ticket: price.ticket,
      ticket_payments,
    };
  };

  export const discountable = async (props: {
    customer: IHubCustomer;
    id: string;
    input: IHubOrderDiscountable.IRequest;
  }): Promise<IHubOrderDiscountable> => {
    const order: IHubOrder = await HubOrderProvider.at({
      actor: props.customer,
      id: props.id,
    });
    if (order.publish !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubOrderPublishErrorCode.CREATED,
        message: "Order has already been published.",
      });
    const price: IHubOrderPrice = await HubOrderPriceProvider.get({
      customer: props.customer,
      id: props.id,
    });
    const goods: IHubOrderGood[] =
      props.input.good_ids === null
        ? order.goods
        : order.goods.filter((good) =>
            props.input.good_ids!.some((id) => id === good.id),
          );
    if (
      props.input.good_ids !== null &&
      props.input.good_ids.length !== goods.length
    )
      throw ErrorProvider.notFound({
        accessor: "input.good_ids",
        code: HubOrderGoodErrorCode.NOT_FOUND,
        message: "Some goods are not found.",
      });
    return {
      deposit: props.customer.citizen
        ? await HubDepositProvider.balance(props.customer.citizen)
        : null,
      combinations: HubOrderDiscountableDiagnoser.combine(props.customer)(
        await take((input) =>
          HubCouponProvider.index({
            actor: props.customer,
            input,
          }),
        ),
        props.customer.citizen
          ? [
              ...(await take((input) =>
                HubCouponTicketProvider.index({
                  customer: props.customer,
                  input,
                }),
              )),
              ...price.ticket_payments.map((tp) => tp.ticket),
            ]
          : [],
      )(goods),
    };
  };

  export const discount = async (props: {
    customer: IHubCustomer;
    id: string;
    input: IHubOrderPrice.ICreate;
  }): Promise<IHubOrderPrice> => {
    const { order, price, combination } = await prepare(props);

    await HubGlobal.prisma.mv_hub_order_prices.update({
      where: {
        hub_order_id: props.id,
      },
      data: {
        deposit: price.deposit,
        ticket: price.ticket,
      },
    });
    for (const good of order.goods) {
      const ticket =
        combination !== null
          ? {
              amount: combination.entries
                .filter((e) => e.good_id === good.id)
                .map((e) => e.amount)
                .reduce((x, y) => x + y, 0),
              percent: price.ticket_payments
                .filter(
                  (tp) =>
                    tp.ticket.coupon.discount.unit === "percent" &&
                    combination.entries.some(
                      (e) =>
                        e.good_id === good.id &&
                        e.coupon_id === tp.ticket.coupon.id,
                    ),
                )
                .map((tp) => tp.ticket.coupon.discount.value)
                .reduce((x, y) => x + y, 0),
            }
          : null;
      await HubGlobal.prisma.mv_hub_order_good_prices.update({
        where: {
          hub_order_good_id: good.id,
        },
        data: {
          deposit: good.price.value - (ticket?.amount ?? 0),
          ticket: ticket?.amount ?? 0,
        },
      });
      for (const unit of good.commodity.sale.units)
        await HubGlobal.prisma.mv_hub_order_good_unit_prices.update({
          where: {
            hub_order_good_id_hub_sale_snapshot_unit_id: {
              hub_order_good_id: good.id,
              hub_sale_snapshot_unit_id: unit.id,
            },
          },
          data: {
            fixed_ticket:
              ticket !== null
                ? (ticket.amount * unit.stock.price.fixed.value) /
                  good.price.value
                : 0,
            variable_ticket:
              ticket !== null
                ? (unit.stock.price.variable.value * ticket.percent) / 100
                : 0,
          },
        });
    }
    return price;
  };

  const prepare = async (props: {
    customer: IHubCustomer;
    id: string;
    input: IHubOrderPrice.ICreate;
  }): Promise<IAsset> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.customer);
    // FIND ORDER
    const order: IHubOrder = await HubOrderProvider.at({
      actor: props.customer,
      id: props.id,
    });
    if (order.publish !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubOrderPublishErrorCode.CREATED,
        message: "Order has been already published.",
      });

    // REMOVE PREVIOUS TICKET PAYMENTS
    await HubGlobal.prisma.hub_coupon_ticket_payments.deleteMany({
      where: {
        hub_order_id: order.id,
      },
    });

    // WHEN NO COUPON BEING USED
    if (props.input.coupon_ids.length === 0)
      return {
        order,
        price: {
          value: order.price.value,
          deposit: order.price.value,
          ticket: 0,
          ticket_payments: [],
        },
        combination: null,
      };

    // GET TICKETS AND COUPONS
    const tickets: IHubCouponTicket[] = HubCouponTicketDiagnoser.unique(
      await ArrayUtil.asyncMap(
        await HubGlobal.prisma.hub_coupon_tickets.findMany({
          where: {
            AND: [
              {
                hub_coupon_id: {
                  in: props.input.coupon_ids,
                },
              },
              ...HubCouponTicketProvider.where(props.customer).AND,
            ],
          },
          ...HubCouponTicketProvider.json.select(props.customer),
        }),
      )((records) => HubCouponTicketProvider.json.transform(records, langCode)),
    );
    const coupons: IHubCoupon[] =
      tickets.length === props.input.coupon_ids.length
        ? []
        : await ArrayUtil.asyncMap(
            await HubGlobal.prisma.hub_coupons.findMany({
              where: {
                AND: [
                  {
                    id: {
                      in: props.input.coupon_ids,
                    },
                  },
                  ...HubCouponProvider.wherePossible().AND,
                ],
              },
              ...HubCouponProvider.json.select(props.customer),
            }),
          )((records) => HubCouponProvider.json.transform(records, langCode));
    if (tickets.length + coupons.length !== props.input.coupon_ids.length)
      throw ErrorProvider.notFound({
        accessor: "input.coupon_ids",
        code: HubCouponErrorCode.NOT_FOUND,
        message: "Some coupons are not found.",
      });

    // VALIDATE APPLICABILITY
    const entire: IHubCoupon[] = [...tickets.map((t) => t.coupon), ...coupons];
    const adjustable: boolean =
      (entire.every(
        HubOrderDiscountableDiagnoser.checkCoupon(props.customer)(order.goods),
      ) &&
        entire.length === 1) ||
      entire.every((c) => false === c.restriction.exclusive);
    if (false === adjustable)
      throw ErrorProvider.unprocessable({
        accessor: "input.coupon_ids",
        code: HubCouponErrorCode.COUPON_NOT_APPLICABLE,
        message: "Some coupons are not applicable.",
      });

    // ISSUE TICKETS IF REQUIRED
    if (coupons.length)
      tickets.push(
        ...(await ArrayUtil.asyncMap(coupons)((c) =>
          HubCouponTicketProvider.create({
            customer: props.customer,
            input: {
              coupon_id: c.id,
            },
          }),
        )),
      );

    // DO PAYMENT
    const payments: IHubCouponTicketPayment[] = await ArrayUtil.asyncMap(
      tickets,
    )((v, i) =>
      HubCouponTicketPaymentProvider.create({
        order,
        ticket: v,
        sequence: i,
      }),
    );

    // RETURNS
    const [combination] = HubOrderDiscountableDiagnoser.combine(props.customer)(
      entire,
      [],
    )(order.goods);
    return {
      order,
      price: {
        value: order.price.value,
        deposit: order.price.value - combination.amount,
        ticket: combination.amount,
        ticket_payments: payments,
      },
      combination,
    };
  };
}

const take = async <T extends object>(
  closure: (input: IPage.IRequest) => Promise<IPage<T>>,
): Promise<T[]> => {
  const page = await closure({ limit: 0 });
  return page.data;
};

interface IAsset {
  order: IHubOrder;
  price: IHubOrderPrice;
  combination: IHubOrderDiscountable.ICombination | null;
}
