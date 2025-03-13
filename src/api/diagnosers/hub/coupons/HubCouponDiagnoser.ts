import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";

import { HubCouponCriteriaDiagnoser } from "./HubCouponCriteriaDiagnoser";

/**
 * 할인 쿠폰 진단기.
 *
 * @author Samchon
 */
export namespace HubCouponDiagnoser {
  /**
   * 적용 가능 여부 확인.
   *
   * 특정 {@link IHubCustomer 고객} 및 {@link IHubSale 매물}을 대상으로,
   * 타깃 {@link IHubCoupon 할인 쿠폰}이 적용 가능한지 판단한다.
   *
   * 단, 본 함수는 오직 {@link IHubCouponCriteria} 만을 검사할 뿐이며, 여타
   * 세밀한 제약들에 대한 검사는 {@link HubCartDiscountDiagnoser} 나
   * {@link HubOrderDiscountDiagnoser} 진단기를 활용토록 하자.
   *
   * @param customer 고객 정보
   * @returns 커링 함수
   */
  export const adjustable =
    (customer: IHubCustomer) =>
    /**
     * @param sale 대상 매물
     */
    (sale: IHubSaleSnapshot.IInvert) =>
    /**
     * @param coupon 적용할 쿠폰
     */
    (coupon: IHubCoupon) =>
      coupon.criterias.every((criteria) =>
        HubCouponCriteriaDiagnoser.adjustable(customer)(sale)(criteria),
      );

  /**
   * 동시적용 가능여부 확인.
   *
   * 할인 쿠폰들이 동시에 적용 가능한지 판단한다.
   *
   * 정확히는 {@link IHubCoupon.restriction.exclusive} 속성이 `false`인 쿠폰들만
   * 있는 지를 검사한다. 물론 쿠폰이 단 하나만 있는 경우에는 무조건 `true`를 리턴.
   *
   * @param coupons 검사 대상 할인 쿠폰 리스트
   * @returns 동시 적용 가능 여부
   */
  export const coexistable = (coupons: IHubCoupon[]): boolean =>
    coupons.length <= 1 ||
    coupons.every((c) => c.restriction.exclusive === false);

  /**
   * 할인 쿠폰 정렬하기.
   *
   * 할인 쿠폰들을, 기대 할인 효과가 높은 순으로 정렬한다.
   *
   * 단, {@link IHubCoupon.IDiscount.unit 퍼센트와 절대금액}이 같이 섞여있는 경우,
   * 퍼센트 할인이 더 기대 효과가 높은 것으로 간주한다. 그리고 같은 절대 금액 할인 쿠폰
   * 중에서도, {@link IHubCoupon.discount.multiplicative 복수 적용 가능}한
   * 것을 더 높게 친다.
   *
   * @param coupons 정렬 대상 할인 쿠폰 리스트
   * @returns 정렬된 할인 쿠폰 배열 (입력값과 동일)
   */
  export function sort<T extends IHubCoupon>(coupons: T[]): T[] {
    return coupons.sort(compare);
  }

  function compare(x: IHubCoupon, y: IHubCoupon): number {
    if (x.discount.unit !== y.discount.unit)
      return x.discount.unit === "percent" ? -1 : 1;
    else if (x.discount.unit === "amount" && y.discount.unit === "amount")
      return Number(x.discount.value) - Number(y.discount.value);
    else return y.discount.value - x.discount.value;
  }
}
