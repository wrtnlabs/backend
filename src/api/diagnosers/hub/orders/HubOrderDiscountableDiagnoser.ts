import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponTicket } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicket";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";
import { IHubOrderDiscountable } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderDiscountable";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";

import { HubDiscountableDiagnoser } from "../coupons/HubDiscountableDiagnoser";

export namespace HubOrderDiscountableDiagnoser {
  export const checkCoupon =
    (customer: IHubCustomer) =>
    (goods: IHubOrderGood[]) =>
    (coupon: IHubCoupon): boolean =>
      HubDiscountableDiagnoser.checkCoupon(accessor)(customer)(goods)(coupon);

  export const filterGoods =
    (customer: IHubCustomer) =>
    (coupon: IHubCoupon) =>
    (goods: IHubOrderGood[]): IHubOrderGood[] =>
      HubDiscountableDiagnoser.filterItems(accessor)(customer)(coupon)(goods);

  export const combine =
    (customer: IHubCustomer) =>
    (coupons: IHubCoupon[], tickets: IHubCouponTicket[]) =>
    (goods: IHubOrderGood[]): IHubOrderDiscountable.ICombination[] =>
      HubDiscountableDiagnoser.combine({
        className: "HubOrderDiscountableDiagnoser",
        accessor,
      })(customer)(
        coupons,
        tickets,
      )(goods).map((comb) => ({
        ...comb,
        entries: comb.entries.map((entry) => ({
          coupon_id: entry.coupon_id,
          good_id: entry.item_id,
          amount: entry.amount,
        })),
      }));

  export const discount =
    (customer: IHubCustomer) =>
    (coupons: IHubCoupon[]) =>
    (
      goods: IHubOrderGood[],
    ): HubDiscountableDiagnoser.IDiscount<IHubOrderGood> =>
      HubDiscountableDiagnoser.discount({
        className: "HubOrderDiscountableDiagnoser",
        accessor,
      })(customer)(coupons)(goods);

  const accessor = (good: IHubOrderGood): IHubCartCommodity => good.commodity;
}
