import { RandomGenerator } from "@nestia/e2e";

import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponDiscount } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponDiscount";
import { IHubCouponRestriction } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponRestriction";

export const prepare_random_coupon = (
  input: Partial<Omit<IHubCoupon.ICreate, "discount" | "restriction">> &
    Partial<{
      discount: Partial<IHubCouponDiscount>;
      restriction: Partial<IHubCouponRestriction>;
    }> = {},
): IHubCoupon.ICreate => ({
  name: RandomGenerator.name(16),
  opened_at: input?.opened_at ?? new Date().toISOString(),
  closed_at: input?.closed_at ?? null,
  discount:
    input.discount?.unit !== undefined
      ? input.discount.unit === "amount"
        ? ({
            unit: "amount",
            value: 5_000,
            threshold: null,
            ...input.discount,
          } satisfies IHubCouponDiscount.IAmount)
        : ({
            unit: "percent",
            value: 10,
            threshold: null,
            limit: null,
            ...((input.discount ?? {}) as Partial<IHubCouponDiscount.IPercent>),
          } satisfies IHubCouponDiscount.IPercent)
      : ({
          unit: "amount",
          value: 5_000,
          threshold: null,
        } satisfies IHubCouponDiscount.IAmount),
  restriction: {
    access: "public" as const,
    volume: null,
    volume_per_citizen: null,
    exclusive: false,
    expired_in: 15,
    expired_at: null,
    ...(input.restriction ?? {}),
  } satisfies IHubCouponRestriction,
  criterias: input.criterias ?? [],
});
