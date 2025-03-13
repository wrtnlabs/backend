import { Prisma } from "@prisma/client";
import { IPointer } from "tstl";

import { HubSystematicErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSystematicErrorCode";
import { IHubCouponCriteria } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteria";
import { IHubCouponCriteriaOfSection } from "@wrtnlabs/os-api/lib/structures/hub/coupons/IHubCouponCriteriaOfSection";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { HubGlobal } from "../../../HubGlobal";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubSectionProvider } from "../systematic/HubSectionProvider";

export namespace HubCouponCriteriaOfSectionProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      inputList: Prisma.hub_coupon_criteria_of_sectionsGetPayload<
        ReturnType<typeof select>
      >[],
    ): IHubSection[] =>
      inputList.map((input) =>
        HubSectionProvider.json.transform(input.section),
      );

    export const select = () =>
      ({
        include: {
          section: HubSectionProvider.json.select(),
        },
      }) satisfies Prisma.hub_coupon_criteria_of_sectionsFindManyArgs;
  }

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const collect = async (props: {
    counter: IPointer<number>;
    base: () => IHubCouponCriteria.ICollectBase;
    input: IHubCouponCriteriaOfSection.ICreate;
  }) => {
    const sectionList = await HubGlobal.prisma.hub_sections.findMany({
      where: {
        code: {
          in: props.input.section_codes,
        },
      },
    });
    if (sectionList.length !== props.input.section_codes.length)
      throw ErrorProvider.notFound({
        accessor: "input.criterias[].section_codes",
        code: HubSystematicErrorCode.SECTION_NOT_FOUND,
        message: "Some sections are not found.",
      });
    return sectionList.map((section) => ({
      ...props.base(),
      sequence: props.counter.value++,
      of_section: {
        create: {
          hub_section_id: section.id,
        },
      },
    })) satisfies Prisma.hub_coupon_criteriasCreateWithoutCouponInput[];
  };
}
