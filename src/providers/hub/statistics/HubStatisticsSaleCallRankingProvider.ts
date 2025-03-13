import { Prisma } from "@prisma/client";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleCallRanking } from "@wrtnlabs/os-api/lib/structures/hub/statistics/aggregates/activity/IHubSaleCallRanking";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { HubSaleProvider } from "../sales/HubSaleProvider";

export namespace HubStatisticsSaleCallRankingProvider {
  export namespace json {
    export const transform = async (
      input: Prisma.mv_hub_sale_call_rankingsGetPayload<
        ReturnType<typeof select>
      >,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubSaleCallRanking> => ({
      sale: await HubSaleProvider.summary.transform(input.sale, lang_code),
      count: input.count,
      success: input.success,
      value: input.value,
    });
    export const select = (
      actor: IHubActorEntity,
      state: "approved" | "last",
    ) =>
      ({
        include: {
          sale: HubSaleProvider.summary.select(actor, state),
        },
      }) satisfies Prisma.mv_hub_sale_call_rankingsFindManyArgs;
  }

  export const index = async (props: {
    actor: IHubActorEntity;
    input: IPage.IRequest;
  }): Promise<IPage<IHubSaleCallRanking>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.mv_hub_sale_call_rankings,
      payload: json.select(
        props.actor,
        props.actor.type === "customer" ? "approved" : "last",
      ),
      transform: (records) => json.transform(records, langCode),
    })({
      where: {},
      orderBy: [
        {
          value: "asc",
        },
      ],
    } satisfies Prisma.mv_hub_sale_call_rankingsFindManyArgs)(props.input);
  };
}
