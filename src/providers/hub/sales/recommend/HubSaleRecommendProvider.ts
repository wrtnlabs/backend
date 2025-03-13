import { Prisma } from "@prisma/client";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleRecommend } from "@wrtnlabs/os-api/lib/structures/hub/sales/recommend/IHubSaleRecommend";

import { HubGlobal } from "../../../../HubGlobal";
import { LanguageUtil } from "../../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../../utils/PaginationUtil";
import { HubSaleProvider } from "../HubSaleProvider";

export namespace HubSaleRecommendProvider {
  export namespace summary {
    export const select = (
      actor: IHubActorEntity,
      state: "approved" | "last",
    ) =>
      ({
        include: {
          sale: HubSaleProvider.summary.select(actor, state),
        },
      }) satisfies Prisma.mv_hub_sale_rankingsFindManyArgs;

    export const transform = async (
      input: Prisma.mv_hub_sale_rankingsGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubSaleRecommend> => ({
      ...(await HubSaleProvider.summary.transform(input.sale, lang_code)),
    });
  }

  export const index = async (props: {
    actor: IHubActorEntity;
    input: IHubSaleRecommend.IRequest;
  }): Promise<IPage<IHubSaleRecommend>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.mv_hub_sale_rankings,
      payload: summary.select(
        props.actor,
        props.actor.type === "customer" ? "approved" : "last",
      ),
      transform: (records) => summary.transform(records, langCode),
    })({
      where: {
        AND: [
          {
            sale: {
              AND: [
                ...HubSaleProvider.where(props.actor, true),
                ...(props.input.search?.sale !== undefined
                  ? [
                      ...(await HubSaleProvider.search({
                        actor: props.actor,
                        input: props.input.search.sale,
                      })),
                    ]
                  : []),
              ],
            },
          },
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ view_count: "asc" }],
    } satisfies Prisma.mv_hub_sale_rankingsFindManyArgs)(props.input);
  };

  const orderBy = (
    key: IHubSaleRecommend.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "sale.view_count"
      ? { view_count: direction }
      : {}) satisfies Prisma.mv_hub_sale_rankingsOrderByWithRelationInput;
}
