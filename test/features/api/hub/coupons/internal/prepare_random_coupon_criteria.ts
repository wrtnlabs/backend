import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubCouponCriteriaOfFunnel } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteriaOfFunnel";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { TestGlobal } from "../../../../../TestGlobal";

export const prepare_random_coupon_criteria = (
  props: prepare_random_coupon_criteria.IProps,
): IHubCouponCriteria.ICreate =>
  props.type === "section"
    ? {
        type: props.type,
        direction: props.direction,
        section_codes: [props.sale.section.code],
      }
    : props.type === "seller"
      ? {
          type: props.type,
          direction: props.direction,
          seller_ids: [props.sale.seller.id],
        }
      : props.type === "sale"
        ? {
            type: props.type,
            direction: props.direction,
            sale_ids: [props.sale.id],
          }
        : {
            type: props.type,
            direction: props.direction,
            funnels: funnels(props.customer),
          };
export namespace prepare_random_coupon_criteria {
  export interface IProps {
    customer: IHubCustomer | null;
    type: IHubCouponCriteria.Type;
    direction: "include" | "exclude";
    sale: IHubSale;
  }
}

const funnels = (
  customer: IHubCustomer | null,
): IHubCouponCriteriaOfFunnel.IFunnel[] => {
  const params: URLSearchParams = (() => {
    if (customer === null) return new URLSearchParams();
    const index: number = customer.href.indexOf("?");
    if (index === -1) return new URLSearchParams();
    return new URLSearchParams(customer.href.slice(index + 1));
  })();

  return [
    {
      kind: "url",
      value: customer?.href ?? TestGlobal.HREF,
    },
    {
      kind: "referrer",
      value: customer?.referrer ?? (TestGlobal.REFERRER as string),
    },
    ...[...params.entries()].map(([key, value]) => ({
      kind: "variable" as const,
      key,
      value,
    })),
  ];
};
