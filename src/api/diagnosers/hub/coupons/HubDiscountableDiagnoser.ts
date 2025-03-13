import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubCoupon } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCoupon";
import { IHubCouponCombination } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCombination";
import { IHubCouponTicket } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponTicket";
import { IHubCartCommodity } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubCartCommodity";

import { HubCouponDiagnoser } from "./HubCouponDiagnoser";

export namespace HubDiscountableDiagnoser {
  export type Accessor<T> = (value: T) => IHubCartCommodity;

  /* -----------------------------------------------------------
    FILTERS
  ----------------------------------------------------------- */
  export const checkCoupon =
    <T extends IEntity>(accessor: Accessor<T>) =>
    (customer: IHubCustomer) =>
    (data: T[]) =>
    (coupon: IHubCoupon): boolean =>
      filterItems(accessor)(customer)(coupon)(data).length !== 0;

  export const filterItems =
    <T extends IEntity>(accessor: Accessor<T>) =>
    (customer: IHubCustomer) =>
    (coupon: IHubCoupon) =>
    (data: T[]) =>
      _Filter_criterias(accessor)(customer)(coupon)(data);

  const _Filter_criterias =
    <T extends IEntity>(accessor: Accessor<T>) =>
    (customer: IHubCustomer) =>
    (coupon: IHubCoupon) =>
    (data: T[]) =>
      _Filter_threshold(accessor)(coupon)(
        data.filter((elem) =>
          HubCouponDiagnoser.adjustable(customer)(accessor(elem).sale)(coupon),
        ),
      );

  const _Filter_threshold =
    <T extends IEntity>(accessor: Accessor<T>) =>
    (coupon: IHubCoupon) =>
    (data: T[]) => {
      if (coupon.discount.threshold === null) return data;
      const sum: number = data
        .map((elem) => getPrice(accessor(elem)))
        .reduce((x, y) => x + y, 0);
      return sum >= coupon.discount.threshold ? data : [];
    };

  /* -----------------------------------------------------------
    COMPUTATIONS
  ----------------------------------------------------------- */
  export interface IDiscount<T extends IEntity> {
    amount: number;

    /**
     * 1st key: coupon.id
     * 2nd key: item.id
     * value: amount
     */
    coupon_to_elem_dict: Map<string, Map<string, number>>;
  }
  export namespace IDiscount {
    export interface IElemToCoupon<Coupon extends IHubCoupon> {
      amount: number;
      coupons: Coupon[];
    }
  }

  export const discount =
    <T extends IEntity>(props: { className: string; accessor: Accessor<T> }) =>
    (customer: IHubCustomer) =>
    (coupons: IHubCoupon[]) =>
    (data: T[]): IDiscount<T> =>
      _Discount({
        title: `${props.className}.discount`,
        accessor: props.accessor,
      })(customer)(coupons)(data);

  const _Discount =
    <T extends IEntity>(props: { title: string; accessor: Accessor<T> }) =>
    (customer: IHubCustomer) =>
    <Coupon extends IHubCoupon>(couponList: Coupon[]) =>
    (data: T[]): IDiscount<T> => {
      // SORT COUPONS
      HubCouponDiagnoser.sort(couponList);

      // CHECK POSSIBILITY
      if (false === HubCouponDiagnoser.coexistable(couponList))
        throw new Error(
          `Error on ${props.title}(): target coupons are not coexistable.`,
        );

      // CONSTRUCT DISCOUNT Code
      const output: IDiscount<T> = {
        amount: 0,
        coupon_to_elem_dict: new Map(),
      };

      // DO DISCOUNT
      for (const coupon of couponList) {
        const filtered: T[] = _Filter_criterias(props.accessor)(customer)(
          coupon,
        )(data);
        if (filtered.length !== 0)
          _Determine(props.accessor)(coupon)(data)(output);
      }
      return output;
    };

  const _Determine =
    <T extends IEntity>(accessor: Accessor<T>) =>
    (coupon: IHubCoupon) =>
    (data: T[]) =>
    (output: IDiscount<T>) => {
      const adjust = (elem: T, value: number) => {
        take(output.coupon_to_elem_dict)(coupon.id)(
          () => new Map<string, number>(),
        ).set(elem.id, value);
      };

      if (coupon.discount.unit === "percent") {
        for (const elem of data) {
          // DISCOUNTED VALUE
          const value: number =
            (coupon.discount.value / 100) * getPrice(accessor(elem));

          // ADJUST
          output.amount += value;
          adjust(elem, value);
        }
      } else {
        const denominator: number = data
          .map((elem) => getPrice(accessor(elem)))
          .reduce((x, y) => x + y, 0);

        for (const elem of data) {
          const value: number =
            ((coupon.discount.value / 100) * getPrice(accessor(elem))) /
            denominator;
          adjust(elem, value);
        }
        output.amount += coupon.discount.value;
      }
    };

  const getPrice = (elem: IHubCartCommodity): number =>
    elem.sale.units
      .map((u) => u.stock.price.fixed.deposit)
      .reduce((x, y) => x + y, 0);

  /* -----------------------------------------------------------
    COMBINATOR
  ----------------------------------------------------------- */
  export type ICombination = IHubCouponCombination<IEntry>;
  export interface IEntry extends IHubCouponCombination.IEntry {
    item_id: string;
  }

  export const combine =
    <T extends IEntity>(props: { className: string; accessor: Accessor<T> }) =>
    (customer: IHubCustomer) =>
    (coupons: IHubCoupon[], tickets: IHubCouponTicket[]) =>
    (data: T[]): ICombination[] => {
      // FILTER COUPONS
      const ticketMap: Map<string, IHubCouponTicket> = new Map(
        tickets.map((t) => [t.coupon.id, t]),
      );
      coupons = coupons.filter(
        (c) =>
          false === ticketMap.has(c.id) &&
          checkCoupon(props.accessor)(customer)(data)(c),
      );
      tickets = [...ticketMap.values()].filter((elem) =>
        checkCoupon(props.accessor)(customer)(data)(elem.coupon),
      );

      // CONSTRUCT COUPON MATRIX
      const entire: IHubCoupon[] = [
        ...coupons,
        ...tickets.map((t) => t.coupon),
      ];
      const matrix: IHubCoupon[][] = [
        entire.filter((c) => c.restriction.exclusive === false),
        ...entire
          .filter((c) => c.restriction.exclusive === true)
          .map((c) => [c]),
      ].filter((row) => row.length !== 0);

      // COMPUTE COMBINATIONS
      const combinations: IDiscount<T>[] = matrix.map((coupons) =>
        _Discount({
          title: `${props.className}.combine`,
          accessor: props.accessor,
        })(customer)(coupons)(data),
      );
      return combinations.map((comb, i) => ({
        coupons: matrix[i].filter((x) => coupons.some((y) => x.id === y.id)),
        tickets: tickets.filter((t) =>
          matrix[i].some((c) => c.id === t.coupon.id),
        ),
        entries: [...comb.coupon_to_elem_dict.entries()]
          .map(([coupon_id, elements]) =>
            [...elements.entries()].map(([item_id, amount]) => ({
              coupon_id,
              item_id,
              amount,
            })),
          )
          .flat(),
        amount: comb.amount,
      }));
    };
}

const take =
  <Key, T>(dict: Map<Key, T>) =>
  (key: Key) =>
  (generator: () => T): T => {
    const oldbie: T | undefined = dict.get(key);
    if (oldbie) return oldbie;

    const value: T = generator();
    dict.set(key, value);
    return value;
  };
