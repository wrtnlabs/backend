import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import { OpenApi } from "@samchon/openapi";
import { HubSystematicErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSystematicErrorCode";
import {
  HubSaleSnapshotDiagnoser,
  HubSaleUnitParameterDiagnoser,
} from "@wrtnlabs/os-api/lib/diagnosers/hub";
import { HubCustomerDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors/HubCustomerDiagnoser";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleSnapshotUnitSwagger } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshotUnitSwagger";
import { IHubSaleUnitParameter } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitParameter";
import { IHubSaleUnitSwaggerAccessor } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitSwaggerAccessor";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";
import { v4 } from "uuid";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubSellerProvider } from "../actors/HubSellerProvider";
import { HubStatisticsSaleProvider } from "../statistics/HubStatisticsSaleProvider";
import { HubChannelCategoryProvider } from "../systematic/HubChannelCategoryProvider";
import { HubSaleProvider } from "./HubSaleProvider";
import { HubSaleSnapshotCategoryProvider } from "./HubSaleSnapshotCategoryProvider";
import { HubSaleSnapshotContentProvider } from "./HubSaleSnapshotContentProvider";
import { HubSaleSnapshotUnitParameterProvider } from "./HubSaleSnapshotUnitParameterProvider";
import { HubSaleSnapshotUnitProvider } from "./HubSaleSnapshotUnitProvider";
import { HubSaleSnapshotUnitSwaggerProvider } from "./HubSaleSnapshotUnitSwaggerProvider";
import { HubSaleSnapshotUserPromptProvider } from "./HubSaleSnapshotUserPromptProvider";

export namespace HubSaleSnapshotProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace summary {
    export const transform = async (
      input: Prisma.hub_sale_snapshotsGetPayload<ReturnType<typeof select>>,
      langCode: IHubCustomer.LanguageType,
    ): Promise<Omit<IHubSaleSnapshot.ISummary, "id" | "latest">> => {
      return {
        snapshot_id: input.id,
        version: input.version,
        categories: await ArrayUtil.asyncMap(input.to_categories)((category) =>
          HubSaleSnapshotCategoryProvider.json.transform(category, langCode),
        ),
        units: await Promise.all(
          input.units
            .sort((a, b) => a.sequence - b.sequence)
            .map((record) =>
              HubSaleSnapshotUnitProvider.summary.transform(record, langCode),
            ),
        ),
        content: await (async () => {
          const found = input.contents.find((c) => c.lang_code === langCode);

          return found
            ? HubSaleSnapshotContentProvider.summary.transform(found)
            : HubSaleSnapshotContentProvider.emplace({
                snapshot: { id: input.id },
                langCode,
              });
        })(),
        aggregate: await HubStatisticsSaleProvider.json.transform(input),
        activated_at: input.activated_at?.toISOString() ?? null,
        expired_at: input.expired_at?.toISOString() ?? null,
      };
    };
    export const select = (langCode: string | null) =>
      ({
        include: {
          units: HubSaleSnapshotUnitProvider.summary.select(langCode ?? "en"),
          to_categories: HubSaleSnapshotCategoryProvider.json.select(),
          contents: HubSaleSnapshotContentProvider.selectWithWhere(
            HubSaleSnapshotContentProvider.summary.select(),
            langCode ?? "en",
          ),
          mv_view_per_days: true,
        },
      }) satisfies Prisma.hub_sale_snapshotsFindManyArgs;
  }

  export namespace json {
    export const transform = async (
      input: Prisma.hub_sale_snapshotsGetPayload<ReturnType<typeof select>>,
      langCode: IHubCustomer.LanguageType,
    ): Promise<Omit<IHubSaleSnapshot, "id" | "latest">> => ({
      snapshot_id: input.id,
      version: input.version,
      categories: await ArrayUtil.asyncMap(input.to_categories)((category) =>
        HubSaleSnapshotCategoryProvider.json.transform(category, langCode),
      ),
      units: await Promise.all(
        input.units
          .sort((a, b) => a.sequence - b.sequence)
          .map((records) =>
            HubSaleSnapshotUnitProvider.json.transform(records, langCode),
          ),
      ),
      content: await (async () => {
        const found = input.contents.find((c) => c.lang_code === langCode);
        return found
          ? HubSaleSnapshotContentProvider.json.transform(found)
          : HubSaleSnapshotContentProvider.emplace({
              snapshot: { id: input.id },
              langCode,
            });
      })(),
      system_prompt: input.system_prompt,
      user_prompt_examples: await ArrayUtil.asyncMap(input.to_user_prompts)(
        (prompt) => {
          const found = prompt.to_translates.find(
            (c) => c.lang_code === langCode,
          );

          return found
            ? HubSaleSnapshotUserPromptProvider.json.transform({
                ...prompt,
                to_translates: [found],
              })
            : HubSaleSnapshotUserPromptProvider.emplace({
                prompt: { id: prompt.id },
                langCode,
              });
        },
      ),
      aggregate: await HubStatisticsSaleProvider.json.transform(input),
      activated_at: input.activated_at?.toISOString() ?? null,
      expired_at: input.expired_at?.toISOString() ?? null,
    });
    export const select = (langCode: string | null) =>
      ({
        include: {
          to_categories: HubSaleSnapshotCategoryProvider.json.select(),
          contents: HubSaleSnapshotContentProvider.selectWithWhere(
            HubSaleSnapshotContentProvider.json.select(),
            langCode ?? "en",
          ),
          units: HubSaleSnapshotUnitProvider.json.select(langCode),
          mv_view_per_days: true,
          to_user_prompts: HubSaleSnapshotUserPromptProvider.json.select(),
        },
      }) satisfies Prisma.hub_sale_snapshotsFindManyArgs;
  }

  export namespace history {
    export const transform = async (
      input: Prisma.hub_sale_snapshotsGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubSale> => ({
      ...HubSaleProvider.history.transform(input.sale),
      ...(await json.transform(input, lang_code)),
      id: input.hub_sale_id,
      latest: !!(input.mv_approved ?? input.mv_last),
      audit: null,
    });
    export const select = (
      actor: IHubActorEntity | null,
      state: "last" | "approved",
    ) => {
      const langCode = LanguageUtil.getNonNullActorLanguage(actor);
      return {
        include: {
          to_categories: HubSaleSnapshotCategoryProvider.json.select(),
          contents: HubSaleSnapshotContentProvider.selectWithWhere(
            HubSaleSnapshotContentProvider.json.select(),
            langCode,
          ),
          units: HubSaleSnapshotUnitProvider.json.select(langCode),
          sale: HubSaleProvider.history.select(actor),
          mv_last: state === "last" ? true : false,
          mv_approved: state === "approved" ? true : false,
          mv_view_per_days: true,
          to_user_prompts: HubSaleSnapshotUserPromptProvider.json.select(),
        },
      } satisfies Prisma.hub_sale_snapshotsFindManyArgs;
    };
  }

  export namespace invert {
    export const transform = async (
      input: Prisma.hub_sale_snapshotsGetPayload<ReturnType<typeof select>>,
      langCode: IHubCustomer.LanguageType,
    ): Promise<Omit<IHubSaleSnapshot.IInvert, "units">> => ({
      ...HubSaleProvider.history.transform(input.sale),
      id: input.hub_sale_id,
      snapshot_id: input.id,
      latest: !!(input.mv_approved ?? input.mv_last),
      version: input.version,
      categories: await ArrayUtil.asyncMap(input.to_categories)((category) =>
        HubSaleSnapshotCategoryProvider.json.transform(category, langCode),
      ),
      aggregate: await HubStatisticsSaleProvider.json.transform(input),
      content: await (async () => {
        const found = input.contents.find((c) => c.lang_code === langCode);
        return found
          ? HubSaleSnapshotContentProvider.summary.transform(found)
          : HubSaleSnapshotContentProvider.emplace({
              snapshot: { id: input.id },
              langCode,
            });
      })(),
      system_prompt: input.system_prompt,
      user_prompt_examples: await ArrayUtil.asyncMap(input.to_user_prompts)(
        (prompt) => {
          const found = prompt.to_translates.find(
            (c) => c.lang_code === langCode,
          );

          return found
            ? HubSaleSnapshotUserPromptProvider.json.transform({
                ...prompt,
                to_translates: [found],
              })
            : HubSaleSnapshotUserPromptProvider.emplace({
                prompt: { id: prompt.id },
                langCode,
              });
        },
      ),
      activated_at: input.activated_at?.toISOString() ?? null,
      expired_at: input.expired_at?.toISOString() ?? null,
    });
    export const select = (
      actor: IHubActorEntity | null,
      state: "last" | "approved",
    ) => {
      return {
        include: {
          to_categories: HubSaleSnapshotCategoryProvider.json.select(),
          contents: HubSaleSnapshotContentProvider.selectWithWhere(
            HubSaleSnapshotContentProvider.summary.select(),
            LanguageUtil.getNonNullActorLanguage(actor),
          ),
          sale: HubSaleProvider.history.select(actor),
          mv_last: state === "last",
          mv_approved: state === "approved",
          mv_view_per_days: true,
          to_user_prompts: HubSaleSnapshotUserPromptProvider.json.select(),
        },
      } satisfies Prisma.hub_sale_snapshotsFindManyArgs;
    };
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    input: IPage.IRequest;
  }): Promise<IPage<IHubSaleSnapshot.ISummary>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);

    await ownership(props);
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sale_snapshots,
      payload: {
        include: {
          ...summary.select(LanguageUtil.getNonNullActorLanguage(props.actor))
            .include,
          mv_approved_audited: true,
        },
      },
      transform: async (input) => ({
        ...(await summary.transform(input, langCode)),
        id: input.hub_sale_id,
        latest: !!input.mv_approved_audited,
      }),
    })({
      where: {
        hub_sale_id: props.sale.id,
        activated_at: { not: null },
      },
      orderBy: [{ activated_at: "asc" }],
    } satisfies Prisma.hub_sale_snapshotsFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    id: string;
  }): Promise<IHubSaleSnapshot> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    await ownership(props);
    const record = await HubGlobal.prisma.hub_sale_snapshots.findFirstOrThrow({
      where: {
        id: props.id,
        hub_sale_id: props.sale.id,
        activated_at:
          props.actor.type === "customer" ? { not: null } : undefined,
      },
      include: {
        ...json.select(langCode).include,
        mv_approved_audited: true,
      },
    });
    return {
      ...(await json.transform(record, langCode)),
      id: props.sale.id,
      latest: !!record.mv_approved_audited,
    };
  };

  export const detail = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    id: string;
  }): Promise<IHubSale> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);

    await ownership(props);
    const record = await HubGlobal.prisma.hub_sale_snapshots.findFirstOrThrow({
      where: {
        id: props.id,
        hub_sale_id: props.sale.id,
        activated_at:
          props.actor.type === "customer" ? { not: null } : undefined,
      },
      ...history.select(
        props.actor,
        props.actor.type === "customer" ? "last" : "approved",
      ),
    });
    return history.transform(record, langCode);
  };

  export const swagger = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    id: string;
    input: IHubSaleUnitSwaggerAccessor;
  }): Promise<OpenApi.IDocument> => {
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_units.findFirstOrThrow({
        where: {
          id: props.input.unit_id,
          snapshot: {
            id: props.id,
            sale: {
              id: props.sale.id,
              ...(props.actor.type === "seller"
                ? HubSellerProvider.whereFromCustomerField(props.actor)
                : {}),
            },
          },
        },
      });

    const parameters: IHubSaleUnitParameter[] | undefined =
      props.actor.type === "customer"
        ? await HubSaleSnapshotUnitParameterProvider.all({
            id: props.input.unit_id,
          })
        : undefined;
    const swagger: IHubSaleSnapshotUnitSwagger =
      await HubSaleSnapshotUnitSwaggerProvider.at({
        actor: props.actor,
        sale: props.sale,
        snapshot: { id: record.hub_sale_snapshot_id },
        unit: { id: record.id },
      });
    return HubSaleUnitParameterDiagnoser.prune(
      swagger.swagger,
      parameters ?? [],
    );
  };

  export const search = async (props: {
    accessor: string;
    langCode: IHubCustomer.LanguageType;
    input: IHubSale.IRequest.ISearch | undefined;
  }) =>
    [
      // ID
      ...HubSaleProvider.searchInvert(props.input).map((sale) => ({ sale })),
      // CONTENT
      ...(props.input?.title?.length
        ? [
            {
              contents: {
                some: {
                  title: {
                    contains: props.input.title,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ]
        : []),
      ...(props.input?.content?.length
        ? [
            {
              contents: {
                some: {
                  body: {
                    contains: props.input.content,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ]
        : []),
      ...(props.input?.title_or_content?.length
        ? [
            {
              OR: [
                {
                  contents: {
                    some: {
                      lang_code: props.langCode,
                      title: {
                        contains: props.input.title_or_content,
                        mode: "insensitive" as const,
                      },
                    },
                  },
                },
                {
                  contents: {
                    some: {
                      lang_code: props.langCode,
                      body: {
                        contains: props.input.title_or_content,
                        mode: "insensitive" as const,
                      },
                    },
                  },
                },
              ],
            },
          ]
        : []),
      ...(props.input?.title_or_content_tag?.length
        ? [
            {
              OR: [
                {
                  contents: {
                    some: {
                      lang_code: props.langCode,
                      title: {
                        contains: props.input.title_or_content_tag,
                        mode: "insensitive" as const,
                      },
                    },
                  },
                },
                {
                  contents: {
                    some: {
                      lang_code: props.langCode,
                      body: {
                        contains: props.input.title_or_content_tag,
                        mode: "insensitive" as const,
                      },
                    },
                  },
                },
                {
                  contents: {
                    some: {
                      lang_code: props.langCode,
                      tags: {
                        some: {
                          value: {
                            contains: props.input.title_or_content_tag,
                            mode: "insensitive" as const,
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          ]
        : []),
      ...(props.input?.tags?.length
        ? [
            {
              contents: {
                some: {
                  lang_code: props.langCode,
                  tags: {
                    some: {
                      value: {
                        contains: props.input.title_or_content_tag,
                        mode: "insensitive" as const,
                      },
                    },
                  },
                },
              },
            },
          ]
        : []),
      // CATEGORIES
      ...(props.input?.category_ids?.length
        ? [
            {
              to_categories: {
                some: {
                  hub_channel_category_id: {
                    in: await searchCategories({
                      accessor: props.accessor,
                      langCode: props.langCode,
                      ids: props.input.category_ids,
                    }),
                  },
                },
              },
            },
          ]
        : []),
      // @todo - AGGREGATE NOT YET
    ] satisfies Prisma.hub_sale_snapshotsWhereInput["AND"];

  export const orderBy = (
    key: IHubSale.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "sale.created_at"
      ? { sale: { created_at: value } }
      : key === "sale.opened_at"
        ? { sale: { opened_at: value } }
        : key === "sale.closed_at"
          ? { sale: { closed_at: value } }
          : key === "sale.view_count"
            ? {}
            : key === "goods.payments" ||
                key === "goods.publish_count" ||
                key === "reviews.average" ||
                key === "reviews.count"
              ? { created_at: value } // @todo
              : {
                  sale: {
                    member: {
                      seller: HubSellerProvider.orderBy(key, value),
                    },
                  },
                }) satisfies Prisma.hub_sale_snapshotsOrderByWithRelationInput;

  const ownership = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
  }): Promise<void> => {
    if (props.actor.type !== "seller") return;
    await HubGlobal.prisma.hub_sale_snapshots.findFirstOrThrow({
      where: {
        sale: {
          id: props.sale.id,
          ...HubSellerProvider.whereFromCustomerField(props.actor),
        },
      },
    });
  };

  const searchCategories = async (props: {
    accessor: string;
    langCode: IHubCustomer.LanguageType;
    ids: string[];
  }): Promise<string[]> => {
    const records = await HubGlobal.prisma.hub_channel_categories.findMany({
      where: {
        id: {
          in: props.ids,
        },
      },
    });
    if (records.length !== props.ids.length)
      throw ErrorProvider.notFound({
        accessor: `${props.accessor}.channel_ids`,
        code: HubSystematicErrorCode.CATEGORY_NOT_FOUND,
        message: "Unable to find some categories with matched id.",
      });

    const categories: IHubChannelCategory.IHierarchical[] =
      await ArrayUtil.asyncMap(records)((rec) =>
        HubChannelCategoryProvider.hierarchical.at({
          langCode: props.langCode,
          channel: { id: rec.hub_channel_id },
          id: rec.id,
        }),
      );
    const output: Set<string> = new Set();
    const gather = (category: IHubChannelCategory.IHierarchical) => {
      output.add(category.id);
      category.children.forEach(gather);
    };
    categories.forEach(gather);
    return [...output];
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const collect = async (props: {
    actor: IHubActorEntity;
    accessor: string;
    input: IHubSaleSnapshot.ICreate;
  }) => {
    // VALIDATE THROUGH DIAGNOSER
    const diagnoses: IDiagnosis[] = HubSaleSnapshotDiagnoser.validate(
      props.input,
    ).map((d) => ({
      ...d,
      accessor: d.accessor?.replace("input", props.accessor),
    }));
    if (diagnoses.length) throw ErrorProvider.unprocessable(diagnoses);

    // VALIDATE CATEGORIES
    const categories = await HubGlobal.prisma.hub_channel_categories.findMany({
      where: {
        id: {
          in: props.input.category_ids,
        },
        hub_channel_id: HubCustomerDiagnoser.invert(props.actor).channel.id,
      },
    });
    if (categories.length !== props.input.category_ids.length)
      throw ErrorProvider.notFound({
        code: HubSystematicErrorCode.CATEGORY_NOT_FOUND,
        accessor: "input.category_ids",
        message: "Unable to find some categories with matched id.",
      });

    // DO COLLECT
    return {
      id: v4(),
      version: props.input.version,
      contents: {
        // @todo -> remove legacy compatible code
        create: await ArrayUtil.asyncMap(props.input.contents)(
          HubSaleSnapshotContentProvider.collect,
        ),
      },
      system_prompt: props.input.system_prompt,
      to_user_prompts: {
        create: await ArrayUtil.asyncMap(props.input.user_prompt_examples)(
          (v, i) =>
            HubSaleSnapshotUserPromptProvider.collect({
              prompt: v,
              sequence: i,
            }),
        ),
      },
      to_categories: {
        create: props.input.category_ids.map((cid, i) => ({
          id: v4(),
          sequence: i,
          hub_channel_category_id: cid,
        })),
      },
      units: {
        create: await ArrayUtil.asyncMap(props.input.units)((v, i) =>
          HubSaleSnapshotUnitProvider.collect({
            actor: props.actor,
            input: v,
            sequence: i,
          }),
        ),
      },
      created_at: new Date(),
    } satisfies Prisma.hub_sale_snapshotsCreateWithoutSaleInput;
  };

  // export const updateVersionDescription =
  //   (seller: IHubSeller.IInvert) =>
  //   (sale: IEntity) =>
  //   (id: string) =>
  //   async (
  //     input: IHubSaleSnapshot.IUpdateVersionDescription,
  //   ): Promise<void> => {
  //     await HubGlobal.prisma.hub_sale_snapshots.findFirstOrThrow({
  //       where: {
  //         id,
  //         sale: {
  //           id: sale.id,
  //           customer: {
  //             member: {
  //               seller: {
  //                 id: seller.id,
  //               },
  //             },
  //           },
  //         },
  //         activated_at: { not: null },
  //       },
  //     });
  //     await HubGlobal.prisma.hub_sale_snapshots.update({
  //       where: {
  //         id,
  //       },
  //       data: {
  //         version_description: input.version_description,
  //       },
  //     });
  //   };
}
