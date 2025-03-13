import { ArrayUtil } from "@nestia/e2e";
import { MigrateFetcher } from "@nestia/fetcher/lib/MigrateFetcher";
import { Prisma } from "@prisma/client";
import {
  HttpMigration,
  IHttpMigrateApplication,
  IHttpMigrateRoute,
  OpenApi,
} from "@samchon/openapi";
import typia from "typia";

import { HubOrderErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderErrorCode";
import { HubOrderGoodErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodErrorCode";
import { HubOrderPublishErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderPublishErrorCode";
import { HubSaleUnitParameterDiagnoser } from "@wrtnlabs/os-api/lib/diagnosers/hub";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IExecutionResult } from "@wrtnlabs/os-api/lib/structures/common/IExecutionResult";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubOrderGood } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGood";
import { IHubOrderGoodHistory } from "@wrtnlabs/os-api/lib/structures/hub/orders/IHubOrderGoodHistory";
import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";
import { IHubSaleSnapshotUnitSwagger } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshotUnitSwagger";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IHubSaleUnitParameter } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitParameter";
import { IHubSaleUnitSwaggerAccessor } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnitSwaggerAccessor";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubSaleSnapshotProvider } from "../sales/HubSaleSnapshotProvider";
import { HubSaleSnapshotUnitParameterProvider } from "../sales/HubSaleSnapshotUnitParameterProvider";
import { HubSaleSnapshotUnitProvider } from "../sales/HubSaleSnapshotUnitProvider";
import { HubSaleSnapshotUnitSwaggerProvider } from "../sales/HubSaleSnapshotUnitSwaggerProvider";
import { HubOrderGoodHistoryProvider } from "./HubOrderGoodHistoryProvider";
import { HubOrderGoodProvider } from "./HubOrderGoodProvider";

export namespace HubOrderGoodSnapshotProvider {
  export namespace json {
    export const transform = async (
      input: Prisma.mv_hub_order_good_snapshotsGetPayload<
        ReturnType<typeof select>
      >,
      lang_code: IHubCustomer.LanguageType,
    ): Promise<IHubSaleSnapshot.IInvert> => {
      const original = await HubOrderGoodProvider.json.transform(
        input.good,
        lang_code,
      );
      const snapshot: Omit<IHubSaleSnapshot.IInvert, "units"> =
        await HubSaleSnapshotProvider.invert.transform(
          input.snapshot,
          lang_code,
        );
      const units: IHubSaleUnit.IInvert[] = await ArrayUtil.asyncMap(
        original.commodity.sale.units,
      )(async (unit) => {
        const revised = input.mv_units.find(
          (u) => u.hub_sale_snapshot_unit_origin_id === unit.id,
        );
        return revised === undefined
          ? unit
          : {
              ...(await HubSaleSnapshotUnitProvider.invert.transform(
                revised.unit,
                lang_code,
              )),
              stock: unit.stock,
            };
      });
      return {
        ...snapshot,
        units,
      };
    };
    export const select = (
      actor: IHubActorEntity | null,
      state: "approved" | "last",
    ) =>
      ({
        include: {
          snapshot: HubSaleSnapshotProvider.invert.select(actor, state),
          good: HubOrderGoodProvider.json.select(null, state),
          mv_units: {
            include: {
              unit: HubSaleSnapshotUnitProvider.invert.select(
                LanguageUtil.getNonNullActorLanguage(actor),
              ),
            },
          },
        },
      }) satisfies Prisma.mv_hub_order_good_snapshotsFindFirstArgs;
  }

  export const index = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    input: IPage.IRequest;
  }): Promise<IPage<IHubSaleSnapshot.IInvert>> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    const good = await HubOrderGoodProvider.at({
      actor: props.actor,
      order: props.order,
      id: props.good.id,
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.mv_hub_order_good_snapshots,
      payload: json.select(
        props.actor,
        props.actor.type === "customer" ? "approved" : "last",
      ),
      transform: (records) => json.transform(records, langCode),
    })({
      where: {
        hub_order_good_id: good.id,
      },
      orderBy: [
        {
          snapshot: {
            created_at: "asc",
          },
        },
      ],
    } satisfies Prisma.mv_hub_order_good_snapshotsFindManyArgs)(props.input);
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    order: IEntity;
    good: IEntity;
    id: string;
  }): Promise<IHubSaleSnapshot.IInvert> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    const good = await HubOrderGoodProvider.at({
      actor: props.actor,
      order: props.order,
      id: props.good.id,
    });
    const material =
      await HubGlobal.prisma.mv_hub_order_good_snapshots.findFirstOrThrow({
        where: {
          hub_order_good_id: good.id,
          hub_sale_snapshot_id: props.id,
        },
        ...json.select(
          props.actor,
          props.actor.type === "customer" ? "approved" : "last",
        ),
      });
    return json.transform(material, langCode);
  };

  export const getSwagger = async (props: {
    actor: IHubActorEntity | null;
    order: IEntity;
    good: IEntity;
    id: string;
    input: IHubSaleUnitSwaggerAccessor;
    proxy: boolean;
  }): Promise<OpenApi.IDocument> => {
    await HubOrderGoodProvider.find({
      ...props,
      id: props.good.id,
      payload: {},
    });
    const material =
      await HubGlobal.prisma.mv_hub_order_good_units.findFirstOrThrow({
        where: {
          hub_order_good_id: props.good.id,
          unit: {
            id: props.input.unit_id,
            hub_sale_snapshot_id: props.id,
          },
        },
        include: {
          unit: HubSaleSnapshotUnitProvider.json.select(
            LanguageUtil.getNonNullActorLanguage(props.actor),
          ),
          snapshot: {
            select: {
              hub_sale_id: true,
            },
          },
        },
      });

    const parameters: IHubSaleUnitParameter[] =
      await HubSaleSnapshotUnitParameterProvider.all({
        id: material.hub_sale_snapshot_unit_id,
      });

    const swaggerRecord: IHubSaleSnapshotUnitSwagger =
      await HubSaleSnapshotUnitSwaggerProvider.at({
        actor: props.actor,
        sale: { id: material.snapshot.hub_sale_id },
        snapshot: { id: props.id },
        unit: { id: material.unit.id },
      });
    const swagger: OpenApi.IDocument = HubSaleUnitParameterDiagnoser.prune(
      swaggerRecord.swagger,
      parameters,
    );
    if (props.proxy === true) {
      if (props.actor === null || props.actor.type === "customer")
        swagger.servers = ["real", "dev"].map((type) => ({
          url: `${HubGlobal.env.HUB_PROXY_HOST}/hub/customers/orders/${props.order.id}/goods/${props.good.id}/api/${type}/units/${props.input.unit_id}`,
          description: `${type} server`,
        }));
    }
    return swagger;
  };

  export const execute = async (props: {
    customer: IHubCustomer;
    order: IEntity;
    good: IEntity;
    headers: {
      authorization?: string;
      Authorization?: string;
    };
    id: string;
    input: IHubOrderGood.IExecute;
  }): Promise<IExecutionResult<any>> => {
    const record = await HubGlobal.prisma.mv_hub_order_good_units.findFirst({
      where: {
        good: {
          id: props.good.id,
          order: {
            id: props.order.id,
            customer: HubCustomerProvider.where(props.customer),
          },
        },
        unit: {
          id: props.input.unit_id,
        },
      },
      include: {
        good: {
          include: {
            order: {
              include: {
                publish: true,
              },
            },
          },
        },
      },
    });

    if (record === null) {
      throw ErrorProvider.notFound({
        code: HubOrderGoodErrorCode.NOT_FOUND,
        message: "Order good not found",
      });
    }

    if (record.good.order.publish === null) {
      throw ErrorProvider.unprocessable({
        accessor: "orderId",
        code: HubOrderPublishErrorCode.NOT_CREATED,
        message: "The order has not been not published yet.",
      });
    } else if (record.good.order.cancelled_at !== null) {
      throw ErrorProvider.gone({
        accessor: "orderId",
        code: HubOrderErrorCode.CANCELLED,
        message: "The order has been cancelled.",
      });
    } else if (
      record.good.opened_at === null ||
      Date.now() < new Date(record.good.opened_at).getTime()
    ) {
      throw ErrorProvider.unprocessable({
        accessor: "goodId",
        code: HubOrderGoodErrorCode.NOT_OPENED,
        message: "The good has not been opened yet.",
      });
    } else if (
      record.good.closed_at !== null &&
      Date.now() >= new Date(record.good.closed_at).getTime()
    ) {
      throw ErrorProvider.gone({
        accessor: "goodId",
        code: HubOrderGoodErrorCode.CLOSED,
        message: "The good has been closed.",
      });
    }

    const swagger: OpenApi.IDocument = await getSwagger({
      ...props,
      actor: props.customer,
      proxy: false,
    });
    const migrate: IHttpMigrateApplication = HttpMigration.application(swagger);
    const route: IHttpMigrateRoute | undefined = migrate.routes.find(
      (route) =>
        route.method === props.input.method && route.path === props.input.path,
    );
    if (route === undefined) {
      throw ErrorProvider.notFound({
        code: HubOrderGoodErrorCode.INVALID_URL,
        message: "Route not found",
      });
    }
    const headers = {
      ...typia.misc.assertClone(props.headers),
      ...Object.fromEntries(
        (
          await HubSaleSnapshotUnitParameterProvider.all({
            id: props.input.unit_id,
          })
        ).map((p) => [p.key, p.value]),
      ),
    };
    const callStartTime = new Date();

    return MigrateFetcher.propagate({
      connection: {
        host: (() => {
          const url: string = swagger.servers?.[0].url ?? "http://127.0.0.1";
          return url.endsWith("/") ? url.slice(0, -1) : url;
        })(),
        headers,
      },
      route,
      arguments: props.input.arguments,
    })
      .then(async (value) => {
        await HubOrderGoodHistoryProvider.create({
          good: props.good,
          unit: { id: props.input.unit_id },
          arguments: props.input.arguments,
          output: value.data,
          status: value.status,
          createAt: callStartTime,
          respondAt: new Date(),
        })(route);

        return value.success === true
          ? { success: value.success, value: value.data }
          : { success: value.success, error: value.data };
      })
      .catch(async (error) => {
        await HubOrderGoodHistoryProvider.create({
          good: props.good,
          unit: { id: props.input.unit_id },
          arguments: props.input.arguments,
          output: error.data,
          status: error.status,
          createAt: callStartTime,
          respondAt: null,
        })(route);

        return { success: false, error };
      });
  };

  export const proceed = async (props: {
    customer: IHubCustomer;
    order: IEntity;
    good: IEntity;
    headers: {
      authorization?: string;
      Authorization?: string;
    };
    id: string;
    input: IHubOrderGood.IExecute;
  }): Promise<IHubOrderGoodHistory> => {
    const record = await HubGlobal.prisma.mv_hub_order_good_units.findFirst({
      where: {
        good: {
          id: props.good.id,
          order: {
            id: props.order.id,
            customer: HubCustomerProvider.where(props.customer),
          },
        },
        unit: {
          id: props.input.unit_id,
        },
      },
      include: {
        good: {
          include: {
            order: {
              include: {
                publish: true,
              },
            },
          },
        },
      },
    });
    if (record === null)
      throw ErrorProvider.notFound({
        code: HubOrderGoodErrorCode.NOT_FOUND,
        message: "Order good not found",
      });
    else if (record.good.order.publish === null) {
      throw ErrorProvider.unprocessable({
        accessor: "orderId",
        code: HubOrderPublishErrorCode.NOT_CREATED,
        message: "The order has not been not published yet.",
      });
    } else if (record.good.order.cancelled_at !== null) {
      throw ErrorProvider.gone({
        accessor: "orderId",
        code: HubOrderErrorCode.CANCELLED,
        message: "The order has been cancelled.",
      });
    } else if (
      record.good.opened_at === null ||
      Date.now() < new Date(record.good.opened_at).getTime()
    ) {
      throw ErrorProvider.unprocessable({
        accessor: "goodId",
        code: HubOrderGoodErrorCode.NOT_OPENED,
        message: "The good has not been opened yet.",
      });
    } else if (
      record.good.closed_at !== null &&
      Date.now() >= new Date(record.good.closed_at).getTime()
    ) {
      throw ErrorProvider.gone({
        accessor: "goodId",
        code: HubOrderGoodErrorCode.CLOSED,
        message: "The good has been closed.",
      });
    }

    const swagger: OpenApi.IDocument = await getSwagger({
      ...props,
      actor: props.customer,
      proxy: false,
    });
    const migrate: IHttpMigrateApplication = HttpMigration.application(swagger);
    const route: IHttpMigrateRoute | undefined = migrate.routes.find(
      (route) =>
        route.method === props.input.method && route.path === props.input.path,
    );
    if (route === undefined) {
      throw ErrorProvider.notFound({
        code: HubOrderGoodErrorCode.INVALID_URL,
        message: "Route not found",
      });
    }
    const headers = {
      ...typia.misc.assertClone(props.headers),
      ...Object.fromEntries(
        (
          await HubSaleSnapshotUnitParameterProvider.all({
            id: props.input.unit_id,
          })
        ).map((p) => [p.key, p.value]),
      ),
    };

    const history = await HubOrderGoodHistoryProvider.create({
      good: props.good,
      unit: { id: props.input.unit_id },
      arguments: props.input.arguments,
      output: null,
      status: null,
      createAt: new Date(),
      respondAt: null,
    })(route);

    MigrateFetcher.propagate({
      connection: {
        host: (() => {
          const url: string = swagger.servers?.[0].url ?? "http://127.0.0.1";
          return url.endsWith("/") ? url.slice(0, -1) : url;
        })(),
        headers,
      },
      route,
      arguments: props.input.arguments,
    })
      .then((value) => {
        HubOrderGoodHistoryProvider.update({
          history: { id: history.id },
          status: value.status,
          output: value.data,
          respondAt: new Date(),
        }).catch(() => {});
      })
      .catch((value) => {
        HubOrderGoodHistoryProvider.update({
          history: { id: history.id },
          status: value.status,
          output: null,
          respondAt: null,
        }).catch(() => {});
      });
    return history;
  };
}
