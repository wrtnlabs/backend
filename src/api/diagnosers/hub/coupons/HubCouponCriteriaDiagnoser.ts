import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

export namespace HubCouponCriteriaDiagnoser {
  export const adjustable =
    (customer: IHubCustomer) =>
    (sale: IHubSaleSnapshot.IInvert) =>
    (criteria: IHubCouponCriteria) => {
      const res: boolean = include(customer)(sale)(criteria);
      return criteria.direction === "include" ? res : !res;
    };

  const include =
    (customer: IHubCustomer) =>
    (sale: IHubSaleSnapshot.IInvert) =>
    (criteria: IHubCouponCriteria) => {
      if (criteria.type === "section")
        return criteria.sections.some(
          (section) => section.id === sale.section.id,
        );
      else if (criteria.type === "seller")
        return criteria.sellers.some((seller) => seller.id === sale.seller.id);
      else if (criteria.type === "sale")
        return criteria.sales.some((s) => s.id === sale.id);
      else if (criteria.type === "funnel")
        return criteria.funnels.some((funnel) => {
          if (funnel.kind === "url")
            return customer.href.startsWith(funnel.value);
          else if (funnel.kind === "referrer")
            return customer.referrer.startsWith(funnel.value);
          else if (funnel.kind === "variable") {
            const question: number = customer.href.lastIndexOf("?");
            if (question === -1) return false;

            const params: URLSearchParams = new URLSearchParams(
              customer.href.substring(question + 1),
            );
            return params.get(funnel.key) === funnel.value;
          }
          return false;
        });
      return false;
    };

  const explore =
    (target: IHubChannelCategory.IInvert) =>
    (current: IHubChannelCategory.IInvert): boolean =>
      target.id === current.id ||
      (current.parent !== null && explore(target)(current.parent));
}
