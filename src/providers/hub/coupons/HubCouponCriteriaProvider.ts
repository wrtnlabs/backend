import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import { IPointer } from "tstl";
import typia from "typia";
import { v4 } from "uuid";

import { HubCouponErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubCouponErrorCode";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubCouponCriteriaOfFunnel } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteriaOfFunnel";
import { IHubCouponCriteriaOfSale } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteriaOfSale";
import { IHubCouponCriteriaOfSection } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteriaOfSection";
import { IHubCouponCriteriaOfSeller } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteriaOfSeller";

import { MapUtil } from "../../../api/utils/MapUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCouponCriteriaOfFunnelProvider } from "./HubCouponCriteriaOfFunnelProvider";
import { HubCouponCriteriaOfSaleProvider } from "./HubCouponCriteriaOfSaleProvider";
import { HubCouponCriteriaOfSectionProvider } from "./HubCouponCriteriaOfSectionProvider";
import { HubCouponCriteriaOfSellerProvider } from "./HubCouponCriteriaOfSellerProvider";

export namespace HubCouponCriterialProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = async (
      inputList: Prisma.hub_coupon_criteriasGetPayload<
        ReturnType<typeof select>
      >[],
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubCouponCriteria[]> => {
      const gather = async (
        direction: "include" | "exclude",
      ): Promise<IHubCouponCriteria[]> => {
        const dict: Map<
          IHubCouponCriteria.Type,
          Prisma.hub_coupon_criteriasGetPayload<ReturnType<typeof select>>[]
        > = new Map();
        for (const input of inputList.filter(
          (input) => input.direction === direction,
        ))
          MapUtil.take(dict)(
            typia.assert<IHubCouponCriteria.Type>(input.type),
            () => [],
          ).push(input);
        return ArrayUtil.asyncMap([...dict.entries()])(
          async ([type, inputList]) =>
            type === "section"
              ? <IHubCouponCriteriaOfSection>{
                  type,
                  direction,
                  sections: HubCouponCriteriaOfSectionProvider.json.transform(
                    inputList.map((i) => i.of_section!),
                  ),
                }
              : type === "sale"
                ? <IHubCouponCriteriaOfSale>{
                    type,
                    direction,
                    sales: await HubCouponCriteriaOfSaleProvider.json.transform(
                      inputList.map((i) => i.of_sale!),
                      lang_code,
                    ),
                  }
                : type === "seller"
                  ? <IHubCouponCriteriaOfSeller>{
                      type,
                      direction,
                      sellers: HubCouponCriteriaOfSellerProvider.json.transform(
                        inputList.map((i) => i.of_seller!),
                      ),
                    }
                  : <IHubCouponCriteriaOfFunnel>{
                      type,
                      direction,
                      funnels: HubCouponCriteriaOfFunnelProvider.json.transform(
                        inputList.map((i) => i.of_funnel!),
                      ),
                    },
        );
      };
      const output = [
        ...(await gather("include")),
        ...(await gather("exclude")),
      ];
      return output;
    };
    export const select = (
      actor: IHubActorEntity | null,
      state: "approved" | "last",
    ) =>
      ({
        include: {
          of_section: HubCouponCriteriaOfSectionProvider.json.select(),
          of_sale: HubCouponCriteriaOfSaleProvider.json.select(actor, state),
          of_seller: HubCouponCriteriaOfSellerProvider.json.select(),
          of_funnel: HubCouponCriteriaOfFunnelProvider.json.select(),
        },
      }) satisfies Prisma.hub_coupon_criteriasFindManyArgs;
  }

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const collect = async (props: {
    actor: IHubSeller.IInvert | IHubAdministrator.IInvert;
    inputs: IHubCouponCriteria.ICreate[];
  }) => {
    if (
      props.actor.type === "seller" &&
      props.inputs
        .filter((i) => i.direction === "include")
        .every((i) => i.type !== "sale" && i.type !== "seller")
    )
      throw ErrorProvider.forbidden({
        accessor: "input.criterias[].type",
        code: HubCouponErrorCode.CRITERIA_INSUFFICIENT_FOR_SELLER,
        message:
          "Seller must contain at least one sale or seller criteria of include direction.",
      });

    const counter: IPointer<number> = { value: 0 };
    const matrix = await ArrayUtil.asyncMap(props.inputs)(async (input) => {
      const base = (): IHubCouponCriteria.ICollectBase => ({
        id: v4(),
        direction: input.direction,
        type: input.type,
      });
      if (input.type === "section")
        return HubCouponCriteriaOfSectionProvider.collect({
          counter,
          base,
          input,
        });
      else if (input.type === "sale")
        return HubCouponCriteriaOfSaleProvider.collect({
          actor: props.actor,
          counter,
          base,
          input,
        });
      else if (input.type === "seller")
        return HubCouponCriteriaOfSellerProvider.collect({
          actor: props.actor,
          counter,
          base,
          input,
        });
      else
        return HubCouponCriteriaOfFunnelProvider.collect({
          counter,
          base,
          input,
        });
    });
    return matrix.flat() satisfies Prisma.hub_coupon_criteriasCreateWithoutCouponInput[];
  };
}
