import { Prisma } from "@prisma/client";
import { IPointer } from "tstl";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { HubCouponErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubCouponErrorCode";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubCouponCriteriaOfSeller } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteriaOfSeller";

import { HubGlobal } from "../../../HubGlobal";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubSellerProvider } from "../actors/HubSellerProvider";

export namespace HubCouponCriteriaOfSellerProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_coupon_criteria_of_sellersGetPayload<
        ReturnType<typeof select>
      >[],
    ): IHubSeller[] =>
      input.map((input) => HubSellerProvider.json.transform(input.seller));
    export const select = () =>
      ({
        include: {
          seller: HubSellerProvider.json.select(),
        },
      }) satisfies Prisma.hub_coupon_criteria_of_sellersFindManyArgs;
  }

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const collect = async (props: {
    actor: IHubAdministrator.IInvert | IHubSeller.IInvert;
    counter: IPointer<number>;
    base: () => IHubCouponCriteria.ICollectBase;
    input: IHubCouponCriteriaOfSeller.ICreate;
  }) => {
    if (
      props.actor.type === "seller" &&
      props.input.seller_ids.some((id) => id !== props.actor.id)
    )
      throw ErrorProvider.forbidden({
        accessor: "input.criterias[].seller_ids",
        code: HubCouponErrorCode.CRITERIA_FORBIDDEN_TO_SELLER,
        message: "You cannot add other sellers.",
      });
    const sellers = await HubGlobal.prisma.hub_sellers.findMany({
      where: {
        id: {
          in: props.input.seller_ids,
        },
      },
      select: {
        id: true,
      },
    });
    if (sellers.length !== props.input.seller_ids.length)
      throw ErrorProvider.badRequest({
        accessor: "input.criterias[].seller_ids",
        code: HubActorErrorCode.NOT_JOINED_SELLER,
        message: "Some sellers are not found.",
      });
    return props.input.seller_ids.map((sid) => ({
      ...props.base(),
      sequence: props.counter.value++,
      of_seller: {
        create: {
          hub_seller_id: sid,
        },
      },
    })) satisfies Prisma.hub_coupon_criteriasCreateWithoutCouponInput[];
  };
}
