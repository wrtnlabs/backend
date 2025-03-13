import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { prepare_random_coupon_criteria } from "./prepare_random_coupon_criteria";

export const generate_random_coupon = async (
  props: generate_random_coupon.IProps,
): Promise<IHubCoupon> => {
  const criterias: IHubCouponCriteria.ICreate[] = props.types.map((type) =>
    prepare_random_coupon_criteria({
      ...props,
      type,
    }),
  );
  const coupon: IHubCoupon = await props.create(props.prepare(criterias));
  return coupon;
};
export namespace generate_random_coupon {
  export interface IProps {
    types: IHubCouponCriteria.Type[];
    direction: "include" | "exclude";
    customer: IHubCustomer | null;
    sale: IHubSale;
    create: (input: IHubCoupon.ICreate) => Promise<IHubCoupon>;
    prepare: (criterias: IHubCouponCriteria.ICreate[]) => IHubCoupon.ICreate;
  }
}
