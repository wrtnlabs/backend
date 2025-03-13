import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import { IPointer } from "tstl";

import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubCouponCriteriaOfSale } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteriaOfSale";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";

import { HubGlobal } from "../../../HubGlobal";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubSaleProvider } from "../sales/HubSaleProvider";

export namespace HubCouponCriteriaOfSaleProvider {
  /* -----------------------------------------------------------
      TRANSFORMERS
    ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      inputList: Prisma.hub_coupon_criteria_of_salesGetPayload<
        ReturnType<typeof select>
      >[],
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubSale.ISummary[]> =>
      ArrayUtil.asyncMap(inputList)((input) =>
        HubSaleProvider.summary.transform(input.sale, lang_code),
      );
    export const select = (
      actor: IHubActorEntity | null,
      state: "approved" | "last",
    ) =>
      ({
        include: {
          sale: HubSaleProvider.summary.select(actor, state),
        },
      }) satisfies Prisma.hub_coupon_criteria_of_salesFindManyArgs;
  }

  /* -----------------------------------------------------------
      WRITERS
    ----------------------------------------------------------- */
  export const collect = async (props: {
    actor: IHubAdministrator.IInvert | IHubSeller.IInvert;
    counter: IPointer<number>;
    base: () => IHubCouponCriteria.ICollectBase;
    input: IHubCouponCriteriaOfSale.ICreate;
  }) => {
    const saleList = await HubGlobal.prisma.hub_sales.findMany({
      where: {
        id: {
          in: props.input.sale_ids,
        },
        member:
          props.actor.type === "seller"
            ? {
                seller: {
                  id: props.actor.id,
                },
              }
            : {},
      },
      select: {
        id: true,
      },
    });
    if (saleList.length !== props.input.sale_ids.length)
      throw ErrorProvider.badRequest({
        accessor: "input.criterias[].sale_ids",
        code: HubSaleErrorCode.SALE_NOT_FOUND,
        message: "Some sales are not found.",
      });
    return props.input.sale_ids.map((sid) => ({
      ...props.base(),
      sequence: props.counter.value++,
      of_sale: {
        create: {
          hub_sale_id: sid,
        },
      },
    })) satisfies Prisma.hub_coupon_criteriasCreateWithoutCouponInput[];
  };
}
