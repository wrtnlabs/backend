import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import { OpenApi } from "@samchon/openapi";
import typia from "typia";
import { v4 } from "uuid";

import { CommonErrorCode } from "@wrtnlabs/os-api/lib/constants/common/CommonErrorCode";
import { HubSaleAuditErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleAuditErrorCode";
import { HubSaleErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSaleErrorCode";
import {
  HubSaleDiagnoser,
  HubSaleUnitParameterDiagnoser,
} from "@wrtnlabs/os-api/lib/diagnosers/hub";
import { HubCustomerDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub/actors/HubCustomerDiagnoser";
import { IDiagnosis } from "@wrtnlabs/os-api/lib/structures/common/IDiagnosis";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSeller } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubSeller";
import { IHubSale } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSale";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleSnapshotUnitSwagger } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshotUnitSwagger";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleUnitParameter } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitParameter";
import { IHubSaleUnitSwaggerAccessor } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitSwaggerAccessor";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { SlackProvider } from "../../common/slack/SlackProvider";
import { HubSellerProvider } from "../actors/HubSellerProvider";
import { HubSectionProvider } from "../systematic/HubSectionProvider";
import { HubSaleSnapshotProvider } from "./HubSaleSnapshotProvider";
import { HubSaleSnapshotUnitParameterProvider } from "./HubSaleSnapshotUnitParameterProvider";
import { HubSaleSnapshotUnitSwaggerProvider } from "./HubSaleSnapshotUnitSwaggerProvider";
import { HubSaleAuditProvider } from "./audits/HubSaleAuditProvider";
import { HubSaleViewProvider } from "./view/HubSaleViewProvider";

export namespace HubSaleProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace summary {
    export const transform = async (
      input: Prisma.hub_salesGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubSale.ISummary> => {
      const snapshot = input.mv_last!.approved ?? input.mv_last!.last;
      if (!snapshot)
        throw ErrorProvider.internal({
          code: HubSaleErrorCode.SNAPSHOT_NOT_FOUND,
          message: "No snapshot found.",
        });
      const audit =
        input.mv_last!.approvedAudited?.audit ??
        input.mv_last!.lastAudited?.audit ??
        null;
      return {
        id: input.id,
        section: HubSectionProvider.json.transform(input.section),
        seller: HubSellerProvider.invert.transform(input.customer, () =>
          ErrorProvider.internal({
            code: CommonErrorCode.INTERNAL_PRISMA_ERROR,
            message: "The sale has not been registered by seller.",
          }),
        ),
        latest: input.mv_last!.approved_hub_sale_snapshot_id === snapshot.id,
        audit:
          audit !== null ? HubSaleAuditProvider.invert.transform(audit) : null,
        created_at: input.created_at.toISOString(),
        paused_at: input.paused_at?.toISOString() ?? null,
        suspended_at: input.suspended_at?.toISOString() ?? null,
        opened_at: input.opened_at?.toISOString() ?? null,
        closed_at: input.closed_at?.toISOString() ?? null,
        bookmarked_at: input.bookmarks[0]?.created_at.toISOString() ?? null,
        ...(await HubSaleSnapshotProvider.summary.transform(
          snapshot,
          lang_code,
        )),
      };
    };
    export const select = (
      actor: null | IHubActorEntity,
      state: "approved" | "last",
    ) => {
      const customer =
        actor === null
          ? null
          : actor.type === "customer"
            ? actor
            : actor.customer;
      const snapshot = HubSaleSnapshotProvider.summary.select(
        customer?.lang_code ?? null,
      );
      const audit = {
        include: {
          audit: HubSaleAuditProvider.invert.select(),
        },
      } satisfies Prisma.hub_sale_snapshotsFindManyArgs;
      return {
        include: {
          customer: HubSellerProvider.invert.select(),
          section: HubSectionProvider.json.select(),
          bookmarks:
            actor === null
              ? undefined
              : {
                  where: {
                    hub_member_id:
                      actor.member === null ? undefined : actor.member.id,
                  },
                },
          mv_last: {
            include: {
              approved:
                state === "approved"
                  ? snapshot
                  : ((<any>false) as typeof snapshot),
              last:
                state === "last" ? snapshot : ((<any>false) as typeof snapshot),
              lastAudited:
                state === "last" ? audit : ((<any>false) as typeof audit),
              approvedAudited:
                state === "approved" ? audit : ((<any>false) as typeof audit),
            },
          },
        },
      } satisfies Prisma.hub_salesFindManyArgs;
    };
  }

  export namespace json {
    export const transform = async (
      input: Prisma.hub_salesGetPayload<ReturnType<typeof select>>,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubSale> => {
      const snapshot = input.mv_last!.approved ?? input.mv_last!.last;
      if (!snapshot)
        throw ErrorProvider.internal({
          code: HubSaleErrorCode.SNAPSHOT_NOT_FOUND,
          message: "No snapshot found.",
        });
      const audit =
        input.mv_last!.approvedAudited?.audit ??
        input.mv_last!.lastAudited?.audit ??
        null;
      return {
        id: input.id,
        section: HubSectionProvider.json.transform(input.section),
        seller: HubSellerProvider.invert.transform(input.customer, () =>
          ErrorProvider.internal({
            code: CommonErrorCode.INTERNAL_PRISMA_ERROR,
            message: "The sale has not been registered by seller.",
          }),
        ),
        latest: input.mv_last!.approved_hub_sale_snapshot_id === snapshot.id,
        audit:
          audit !== null ? HubSaleAuditProvider.invert.transform(audit) : null,
        created_at: input.created_at.toISOString(),
        paused_at: input.paused_at?.toISOString() ?? null,
        suspended_at: input.suspended_at?.toISOString() ?? null,
        opened_at: input.opened_at?.toISOString() ?? null,
        closed_at: input.closed_at?.toISOString() ?? null,
        bookmarked_at:
          input.bookmarks === null ||
          input.bookmarks === undefined ||
          input.bookmarks.length === 0
            ? null
            : input.bookmarks[0].created_at.toISOString(),

        ...(await HubSaleSnapshotProvider.json.transform(snapshot, lang_code)),
      };
    };
    export const select = (
      actor: IHubActorEntity | null,
      state: "approved" | "last",
    ) => {
      const snapshot = HubSaleSnapshotProvider.json.select(
        LanguageUtil.getNonNullActorLanguage(actor),
      );
      const audit = {
        include: {
          audit: HubSaleAuditProvider.invert.select(),
        },
      } satisfies Prisma.hub_sale_snapshotsFindManyArgs;
      return {
        include: {
          customer: HubSellerProvider.invert.select(),
          section: HubSectionProvider.json.select(),

          bookmarks:
            actor === null
              ? undefined
              : {
                  where: {
                    hub_member_id:
                      actor.member === null ? undefined : actor.member.id,
                  },
                },

          mv_last: {
            include: {
              approved:
                state === "approved"
                  ? snapshot
                  : ((<any>false) as typeof snapshot),
              last:
                state === "last" ? snapshot : ((<any>false) as typeof snapshot),
              lastAudited:
                state === "last" ? audit : ((<any>false) as typeof audit),
              approvedAudited:
                state === "approved" ? audit : ((<any>false) as typeof audit),
            },
          },
        },
      } satisfies Prisma.hub_salesFindManyArgs;
    };
  }

  export namespace history {
    export const transform = (
      input: Prisma.hub_salesGetPayload<ReturnType<typeof select>>,
    ): Omit<IHubSale, "audit" | keyof IHubSaleSnapshot> => ({
      section: HubSectionProvider.json.transform(input.section),
      seller: HubSellerProvider.invert.transform(input.customer, () =>
        ErrorProvider.internal({
          code: CommonErrorCode.INTERNAL_PRISMA_ERROR,
          message: "The sale has not been registered by seller.",
        }),
      ),
      created_at: input.created_at.toISOString(),
      paused_at: input.paused_at?.toISOString() ?? null,
      suspended_at: input.suspended_at?.toISOString() ?? null,
      opened_at: input.opened_at?.toISOString() ?? null,
      closed_at: input.closed_at?.toISOString() ?? null,
      bookmarked_at: input.bookmarks?.[0]?.created_at.toISOString() ?? null,
    });
    export const select = (actor: IHubActorEntity | null) =>
      ({
        include: {
          customer: HubSellerProvider.invert.select(),
          section: HubSectionProvider.json.select(),
          bookmarks:
            actor === null
              ? undefined
              : {
                  where: {
                    hub_member_id:
                      actor.member === null ? undefined : actor.member.id,
                  },
                },
        },
      }) satisfies Prisma.hub_salesFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    input: IHubSale.IRequest;
  }): Promise<IPage<IHubSale.ISummary>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sales,
      payload: summary.select(
        props.actor,
        props.actor.type === "customer" ? "approved" : "last",
      ),
      transform: (records) => summary.transform(records, langCode),
    })({
      where: {
        AND: [
          ...where(props.actor, true),
          ...(await search({
            actor: props.actor,
            input: props.input.search,
          })),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_salesFindManyArgs)(props.input);
  };

  export const details = async (props: {
    actor: IHubActorEntity;
    input: IHubSale.IRequest;
  }): Promise<IPage<IHubSale>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);

    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sales,
      payload: json.select(
        props.actor,
        props.actor.type === "customer" ? "approved" : "last",
      ),
      transform: (records) => json.transform(records, langCode),
    })({
      where: {
        AND: [
          ...where(props.actor, true),
          ...(await search({
            actor: props.actor,
            input: props.input.search,
          })),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_salesFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    id: string;
    strict: boolean;
  }): Promise<IHubSale> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    const record = await HubGlobal.prisma.hub_sales.findFirstOrThrow({
      where: {
        id: props.id,
        AND: where(props.actor, false),
      },
      ...json.select(
        props.actor,
        props.actor.type === "customer" ? "approved" : "last",
      ),
    });
    const sale: IHubSale = await json.transform(record, langCode);
    if (props.actor.type === "customer" && props.strict === true) {
      const diagnoses: IDiagnosis[] = HubSaleDiagnoser.readable(
        "id",
        false,
      )(sale);
      if (diagnoses.length) throw ErrorProvider.unprocessable(diagnoses);
    }
    if (props.actor.type === "customer")
      await HubSaleViewProvider.create({
        customer: props.actor,
        snapshot: { id: sale.snapshot_id },
      });
    return sale;
  };

  export const swagger = async (props: {
    actor: IHubActorEntity;
    id: string;
    input: IHubSaleUnitSwaggerAccessor;
  }): Promise<OpenApi.IDocument> => {
    const material =
      await HubGlobal.prisma.mv_hub_sale_last_snapshots.findFirstOrThrow({
        where: {
          sale: {
            id: props.id,
            ...(props.actor.type === "seller"
              ? HubSellerProvider.whereFromCustomerField(props.actor)
              : {}),
          },
        },
      });
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_units.findFirstOrThrow({
        where: {
          id: props.input.unit_id,
          hub_sale_snapshot_id:
            props.actor.type === "customer"
              ? material.approved_hub_sale_snapshot_id!
              : material.last_hub_sale_snapshot_id,
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
        sale: { id: props.id },
        snapshot: { id: record.hub_sale_snapshot_id },
        unit: { id: record.id },
      });
    return HubSaleUnitParameterDiagnoser.prune(
      swagger.swagger,
      parameters ?? [],
    );
  };

  export const searchInvert = (input: IHubSale.IRequest.ISearch | undefined) =>
    [
      // ID & SELLER
      ...(input?.id !== undefined ? [{ id: input.id }] : []),
      ...(input?.seller !== undefined
        ? HubSellerProvider.searchFromCustomer(input.seller).map(
            (customer) => ({
              member: {
                customers: {
                  some: {
                    ...customer,
                  },
                },
              },
            }),
          )
        : []),
      // SECTION
      ...(input?.section_codes?.length
        ? [{ section: { code: { in: input.section_codes } } }]
        : []),
    ] satisfies Prisma.hub_salesWhereInput["AND"];

  export const where = (actor: IHubActorEntity, strict: boolean) =>
    [
      {
        customer: {
          hub_channel_id: HubCustomerDiagnoser.invert(actor).channel.id,
        },
      },
      ...(actor.type === "seller"
        ? [HubSellerProvider.whereFromCustomerField(actor)]
        : []),
      ...(actor.type === "customer"
        ? [
            {
              mv_last: {
                approved_hub_sale_snapshot_id: {
                  not: null,
                },
              },
            },
          ]
        : []),
      ...(actor.type === "customer" && strict === true
        ? [
            {
              opened_at: { lte: new Date() },
              suspended_at: null,
              OR: [
                { closed_at: null },
                {
                  closed_at: { gt: new Date() },
                },
              ],
            },
          ]
        : []),
    ] satisfies Prisma.hub_salesWhereInput["AND"];

  export const search = async (props: {
    actor: IHubActorEntity;
    input: IHubSale.IRequest.ISearch | undefined;
  }) => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    return [
      // SALE ENTITY
      ...searchInvert(props.input),
      // STATUS
      ...(props.input?.show_paused === false
        ? [{ paused_at: null }]
        : props.input?.show_paused === "only"
          ? [{ paused_at: { not: null } }]
          : []),
      ...(props.input?.show_suspended !== undefined
        ? props.input.show_suspended === false
          ? [{ suspended_at: null }]
          : props.input.show_suspended === "only"
            ? [{ suspended_at: { not: null } }]
            : []
        : props.actor.type === "customer"
          ? [{ suspended_at: null }]
          : []),

      ...(props.input?.audit !== undefined
        ? props.input.audit.state === "approved"
          ? [
              {
                mv_last: {
                  last: {
                    audit: {
                      state: {
                        approved_at: { not: null },
                      },
                    },
                  },
                },
              },
            ]
          : props.input.audit.state === "rejected"
            ? [
                {
                  mv_last: {
                    last: {
                      audit: {
                        state: {
                          approved_at: null,
                          rejected_at: { not: null },
                        },
                      },
                    },
                  },
                },
              ]
            : props.input.audit.state === "agenda"
              ? [
                  {
                    mv_last: {
                      last: {
                        audit: {
                          state: {
                            approved_at: null,
                            rejected_at: null,
                          },
                        },
                      },
                    },
                  },
                ]
              : props.input.audit.state === "none"
                ? [
                    {
                      mv_last: {
                        last: {
                          audit: null,
                        },
                      },
                    },
                  ]
                : []
        : []),
      ...(props.input?.show_bookmarked === "only"
        ? [{ bookmarks: { some: {} } }]
        : []),

      // TO THE SNAPSHOT
      ...(
        await HubSaleSnapshotProvider.search({
          accessor: "input.search",
          langCode,
          input: props.input,
        })
      ).map((snapshot) => ({
        mv_last: {
          [props.actor.type === "customer" ? "approved" : "last"]: snapshot,
        },
      })),
      // @todo - AGGREGATES
    ] satisfies Prisma.hub_salesWhereInput["AND"];
  };

  export const orderBy = (
    key: IHubSale.IRequest.SortableColumns,
    direction: "asc" | "desc",
  ) =>
    (key === "sale.created_at"
      ? { created_at: direction }
      : key === "sale.opened_at"
        ? { opened_at: direction }
        : key === "sale.closed_at"
          ? { closed_at: direction }
          : key === "sale.view_count"
            ? {
                mv_hub_sale_rankings: {
                  view_count: direction,
                },
              }
            : key === "goods.publish_count" ||
                key === "goods.payments" ||
                key === "reviews.average" ||
                key === "reviews.count" ||
                key === "seller.reviews.average"
              ? { created_at: direction } // @todo
              : {
                  member: {
                    seller: HubSellerProvider.orderBy(key, direction),
                  },
                }) satisfies Prisma.hub_salesOrderByWithRelationInput;

  /* -----------------------------------------------------------
    STORE
  ----------------------------------------------------------- */
  export const create = async (props: {
    seller: IHubSeller.IInvert;
    input: IHubSale.ICreate;
  }): Promise<IHubSale> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.seller);

    // VALIDATE THROUGH DIAGNOSER
    const diagnoses: IDiagnosis[] = HubSaleDiagnoser.validate(
      props.input,
      false,
    );
    if (diagnoses.length) throw ErrorProvider.unprocessable(diagnoses);

    // FIND SECTION
    const section = await HubGlobal.prisma.hub_sections.findFirstOrThrow({
      where: {
        code: props.input.section_code,
      },
    });

    // CREATE A NEW SALE
    const record = await HubGlobal.prisma.hub_sales.create({
      data: await collect({
        seller: props.seller,
        input: props.input,
        section,
      }),
      ...json.select(props.seller, "last"),
    });
    const output: IHubSale = await json.transform(record, langCode);

    if (HubGlobal.mode === "real") {
      await SlackProvider.sendAudit(output);
    }
    if (props.input.__approve === true)
      output.audit = await HubSaleAuditProvider.autoApprove(output);
    return output;
  };

  export const update = async (props: {
    seller: IHubSeller.IInvert;
    id: string;
    input: IHubSale.IUpdate;
  }): Promise<IHubSale> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.seller);

    // CHECK WHETHER UPDATABLE OR NOT
    if (false === (await updatable(props)))
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubSaleAuditErrorCode.CREATED,
        message:
          "The sale is not updatable due to in audit process. Do emend instead.",
      });

    // VALIDATE THROUGH DIAGNOSER
    const diagnoses: IDiagnosis[] = HubSaleDiagnoser.validate(
      props.input,
      false,
    );
    // const duplicated = await HubGlobal.prisma.hub_sale_snapshots.findFirst({
    //   where: {
    //     hub_sale_id: id,
    //     version: input.version,
    //     activated_at: { not: null },
    //   },
    // });
    // if (duplicated)
    //   diagnoses.push({
    //     accessor: "input.version",
    //     message: "duplicated version exists.",
    //   });
    if (diagnoses.length) throw ErrorProvider.unprocessable(diagnoses);

    // ARCHIVE RECORD
    const record = await HubGlobal.prisma.hub_sale_snapshots.create({
      data: {
        sale: { connect: { id: props.id } },
        ...(await HubSaleSnapshotProvider.collect({
          actor: props.seller,
          accessor: "input",
          input: props.input,
        })),
      },
    });

    // UPDATE MATERIAL
    await HubGlobal.prisma.mv_hub_sale_last_snapshots.update({
      where: {
        hub_sale_id: props.id,
      },
      data: {
        last_hub_sale_snapshot_id: record.id,
        approved_hub_sale_snapshot_id: null,
        approved_audited_hub_sale_snapshot_id: null,
      },
    });
    if (props.input.__approve === true)
      await HubSaleAuditProvider.autoApprove({ id: props.id });

    // RELOAD FOR TRANSFORMATION
    const reloaded = await HubGlobal.prisma.hub_sales.findFirstOrThrow({
      where: {
        id: props.id,
      },
      ...json.select(props.seller, "last"),
    });
    return json.transform(reloaded, langCode);
  };

  export const updatable = async (props: {
    seller: IHubSeller.IInvert;
    id: string;
  }): Promise<boolean> => {
    const material =
      await HubGlobal.prisma.mv_hub_sale_last_snapshots.findFirstOrThrow({
        where: {
          sale: {
            id: props.id,
            member: {
              seller: {
                id: props.seller.id,
              },
            },
          },
        },
      });
    return (
      material.last_audited_hub_sale_snapshot_id === null ||
      material.approved_hub_sale_snapshot_id !== null
    );
  };

  export const replica = async (props: {
    seller: IHubSeller.IInvert;
    id: string;
  }): Promise<IHubSale.ICreate> => {
    const sale: IHubSale = await at({
      actor: props.seller,
      id: props.id,
      strict: false,
    });

    const swaggers: {
      unit_id: string;
      swagger: OpenApi.IDocument;
      contents: IHubSaleUnit.IUnitContent[];
    }[] = await ArrayUtil.asyncMap(sale.units)(async (unit) => {
      const record =
        await HubGlobal.prisma.hub_sale_snapshot_units.findFirstOrThrow({
          where: {
            id: unit.id,
          },
          include: {
            to_contents: true,
          },
        });

      const swagger: IHubSaleSnapshotUnitSwagger =
        await HubSaleSnapshotUnitSwaggerProvider.at({
          actor: props.seller,
          sale: { id: sale.id },
          unit: { id: unit.id },
          snapshot: { id: sale.snapshot_id },
        });
      return {
        unit_id: unit.id,
        swagger: swagger.swagger,
        contents: record.to_contents.map((c) => ({
          lang_code: typia.assert<IHubCustomer.LanguageType>(c.lang_code),
          original: c.original,
          name: c.name,
        })),
      };
    });
    return HubSaleDiagnoser.replica(swaggers)(sale);
  };

  export const pause = async (props: {
    seller: IHubSeller;
    id: string;
  }): Promise<void> => {
    const sale = await HubGlobal.prisma.hub_sales.findFirstOrThrow({
      where: {
        id: props.id,
        ...HubSellerProvider.whereFromCustomerField(props.seller),
      },
    });
    if (sale.paused_at !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubSaleErrorCode.SALE_ALREADY_PAUSED,
        message: "The sale has already been paused.",
      });
    await HubGlobal.prisma.hub_sales.update({
      where: {
        id: props.id,
      },
      data: {
        paused_at: new Date(),
        suspended_at: null,
      },
    });
  };

  export const suspend = async (props: {
    seller: IHubSeller;
    id: string;
  }): Promise<void> => {
    const sale = await HubGlobal.prisma.hub_sales.findFirstOrThrow({
      where: {
        id: props.id,
        ...HubSellerProvider.whereFromCustomerField(props.seller),
      },
    });
    if (sale.suspended_at !== null)
      throw ErrorProvider.gone({
        accessor: "id",
        code: HubSaleErrorCode.SALE_ALREADY_SUSPENDED,
        message: "The sale has already been suspended.",
      });
    await HubGlobal.prisma.hub_sales.update({
      where: {
        id: props.id,
      },
      data: {
        suspended_at: new Date(),
        paused_at: null,
      },
    });
  };

  export const restore = async (props: {
    seller: IHubSeller;
    id: string;
  }): Promise<void> => {
    const sale = await HubGlobal.prisma.hub_sales.findFirstOrThrow({
      where: {
        id: props.id,
        ...HubSellerProvider.whereFromCustomerField(props.seller),
      },
    });
    if (sale.suspended_at === null && sale.paused_at === null)
      throw ErrorProvider.unprocessable({
        accessor: "id",
        code: HubSaleErrorCode.SALE_NOT_SUSPENDED,
        message: "The sale has not been suspended nor paused.",
      });
    await HubGlobal.prisma.hub_sales.update({
      where: {
        id: props.id,
      },
      data: {
        suspended_at: null,
        paused_at: null,
      },
    });
  };

  const collect = async (props: {
    seller: IHubSeller.IInvert;
    section: IEntity;
    input: IHubSale.ICreate;
  }) => {
    const snapshot = await HubSaleSnapshotProvider.collect({
      actor: props.seller,
      accessor: "input",
      input: props.input,
    });
    return {
      id: props.input.id ?? v4(),
      section: {
        connect: {
          id: props.section.id,
        },
      },
      customer: {
        connect: {
          id: props.seller.customer.id,
        },
      },
      member: {
        connect: {
          id: props.seller.member.id,
        },
      },
      snapshots: {
        create: [snapshot],
      },
      mv_last: {
        create: {
          last: {
            connect: { id: snapshot.id },
          },
        },
      },
      created_at: new Date(),
      opened_at: props.input.opened_at,
      closed_at: props.input.closed_at,
    } satisfies Prisma.hub_salesCreateInput;
  };
}
