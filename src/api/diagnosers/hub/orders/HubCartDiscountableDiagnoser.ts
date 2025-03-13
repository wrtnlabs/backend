import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponTicket } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicket";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubCartDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartDiscountable";

import { HubDiscountableDiagnoser } from "../coupons/HubDiscountableDiagnoser";

export namespace HubCartDiscountableDiagnoser {
  export const checkCoupon =
    (customer: IHubCustomer) =>
    (commodities: IHubCartCommodity[]) =>
    (coupon: IHubCoupon) =>
      HubDiscountableDiagnoser.checkCoupon(accessor)(customer)(commodities)(
        coupon,
      );

  export const filterCommodities =
    (customer: IHubCustomer) =>
    (coupon: IHubCoupon) =>
    (commodities: IHubCartCommodity[]) =>
      HubDiscountableDiagnoser.filterItems(accessor)(customer)(coupon)(
        commodities,
      );

  export const combine =
    (customer: IHubCustomer) =>
    (coupons: IHubCoupon[], tickets: IHubCouponTicket[]) =>
    (commodities: IHubCartCommodity[]): IHubCartDiscountable.ICombination[] =>
      HubDiscountableDiagnoser.combine({
        className: "HubCartDiscountableDiagnoser",
        accessor,
      })(customer)(
        coupons,
        tickets,
      )(commodities).map((comb) => ({
        ...comb,
        entries: comb.entries.map((entry) => ({
          coupon_id: entry.coupon_id,
          commodity_id: entry.item_id,
          amount: entry.amount,
          pseudo: !!commodities.find((c) => c.id === entry.item_id)?.pseudo,
        })),
      }));

  const accessor = (commodity: IHubCartCommodity): IHubCartCommodity =>
    commodity;
}
