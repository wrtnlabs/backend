import { Prisma } from "@prisma/client";
import { IPointer } from "tstl";

import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubCouponCriteriaOfFunnel } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteriaOfFunnel";

export namespace HubCouponCriteriaOfFunnelProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      inputList: Prisma.hub_coupon_criteria_of_funnelsGetPayload<
        ReturnType<typeof select>
      >[],
    ): IHubCouponCriteriaOfFunnel.IFunnel[] =>
      inputList.map((input) =>
        input.kind === "variable"
          ? {
              kind: "variable",
              key: input.key!,
              value: input.value,
            }
          : {
              kind: input.kind as "url" | "referrer",
              value: input.value,
            },
      );
    export const select = () =>
      ({}) satisfies Prisma.hub_coupon_criteria_of_funnelsFindManyArgs;
  }

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const collect = (props: {
    counter: IPointer<number>;
    base: () => IHubCouponCriteria.ICollectBase;
    input: IHubCouponCriteriaOfFunnel.ICreate;
  }) =>
    props.input.funnels.map((funnel) => ({
      ...props.base(),
      sequence: props.counter.value++,
      of_funnel: {
        create: {
          kind: funnel.kind,
          value: funnel.value,
          key: funnel.kind === "variable" ? funnel.key : null,
        },
      },
    })) satisfies Prisma.hub_coupon_criteriasCreateWithoutCouponInput[];
}
