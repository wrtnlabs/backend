import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import { ChatGptTypeChecker, HttpLlm } from "@samchon/openapi";
import { HubOrderGoodErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubOrderGoodErrorCode";
import { IAuthorization } from "@wrtnlabs/os-api/lib/structures/common/IAuthorization";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubSaleSnapshotUnitSwagger } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshotUnitSwagger";
import { IHubSaleUnit } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleUnit";
import { IStudioMetaChatListener } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatListener";
import { IStudioMetaChatService } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatService";
import { IStudioMetaChatServiceProps } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceProps";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";
import { IStudioMetaChatSessionConnection } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionConnection";
import { IStudioMetaChatSessionMessageOfTalk } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionMessageOfTalk";
import { WebSocketAcceptor } from "tgrid";
import { sleep_for } from "tstl";
import { v4 } from "uuid";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../../hub/actors/HubCustomerProvider";
import { HubOrderGoodProvider } from "../../hub/orders/HubOrderGoodProvider";
import { HubSaleSnapshotUnitSwaggerProvider } from "../../hub/sales/HubSaleSnapshotUnitSwaggerProvider";
import { StudioMetaChatListener } from "./StudioMetaChatListener";
import { StudioMetaChatMockService } from "./StudioMetaChatMockService";
import { StudioMetaChatService } from "./StudioMetaChatService";
import { StudioMetaChatSessionConnectionProvider } from "./StudioMetaChatSessionConnectionProvider";
import { StudioMetaChatSessionMessageProvider } from "./StudioMetaChatSessionMessageProvider";
import { StudioMetaChatSessionTokenUsageProvider } from "./StudioMetaChatSessionTokenUsageProvider";

export namespace StudioMetaChatSessionProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = async (
      input: Prisma.studio_meta_chat_sessionsGetPayload<
        ReturnType<typeof select>
      >,
      langCode: IHubCustomer.LanguageType,
    ): Promise<IStudioMetaChatSession> => ({
      id: input.id,
      customer: HubCustomerProvider.json.transform(input.customer),
      title: input.title,
      goods: await ArrayUtil.asyncMap(
        input.of_goods.sort((a, b) => a.sequence - b.sequence),
      )((pair) => HubOrderGoodProvider.json.transform(pair.good, langCode)),
      connection: input.connections[0]
        ? StudioMetaChatSessionConnectionProvider.json.transform(
            input.connections[0],
          )
        : null,
      last_message: input.mv_last_message
        ? (StudioMetaChatSessionMessageProvider.json.transform(
            input.mv_last_message.message,
          ) as IStudioMetaChatSessionMessageOfTalk)
        : null,
      token_usage: StudioMetaChatSessionTokenUsageProvider.json.transformAll(
        input.token_usages,
      ),
      created_at: input.created_at.toISOString(),
      updated_at: (input.updated_at ?? input.created_at).toISOString(),
      pinned_at: input.pinned_at?.toISOString() ?? null,
    });
    export const select = (actor: IHubActorEntity | null) =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
          of_goods: {
            include: {
              good: HubOrderGoodProvider.invert.select(actor, "approved"),
            },
          },
          connections: {
            ...StudioMetaChatSessionConnectionProvider.json.select(),
            orderBy: { connected_at: "desc" },
            take: 1,
          },
          mv_last_message: {
            include: {
              message: StudioMetaChatSessionMessageProvider.json.select(),
            },
          },
          token_usages: StudioMetaChatSessionTokenUsageProvider.json.select(),
        },
      }) satisfies Prisma.studio_meta_chat_sessionsFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    input: IStudioMetaChatSession.IRequest;
  }): Promise<IPage<IStudioMetaChatSession>> => {
    const pinned: boolean | null = props.input.pinned ?? null;
    const ret = await PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_meta_chat_sessions,
      payload: json.select(props.actor),
      transform: (v) =>
        json.transform(v, LanguageUtil.getNonNullActorLanguage(props.actor)),
    })({
      where: {
        AND: [
          {
            ...(props.actor.type === "administrator"
              ? undefined
              : props.actor.member === null
                ? {
                    customer: HubCustomerProvider.where(props.actor),
                  }
                : {
                    member: { id: props.actor.member.id },
                  }),
            deleted_at: null,
            pinned_at:
              pinned === null
                ? undefined
                : pinned === true
                  ? { not: null }
                  : null,
            mv_last_message: {
              isNot: null,
            },
          },
          ...search(props.input.search),
        ],
      },
      orderBy: [
        ...(pinned === null
          ? ([
              { pinned_at: "asc" },
            ] satisfies Prisma.studio_meta_chat_sessionsOrderByWithRelationInput[])
          : []),
        ...(props.input.sort?.length
          ? (PaginationUtil.orderBy(orderBy)(
              props.input.sort,
            ) satisfies Prisma.studio_meta_chat_sessionsOrderByWithRelationInput[])
          : ([
              { created_at: "desc" },
            ] satisfies Prisma.studio_meta_chat_sessionsOrderByWithRelationInput[])),
      ],
    } satisfies Prisma.studio_meta_chat_sessionsFindFirstArgs)(props.input);
    return ret;
  };

  export const at = async (props: {
    actor: IHubActorEntity | null;
    id: string;
    readonly?: boolean;
  }): Promise<IStudioMetaChatSession> => {
    const record = await find({
      payload: json.select(props.actor),
      ...props,
      readonly: props.readonly ?? true,
    });
    return json.transform(
      record,
      LanguageUtil.getNonNullActorLanguage(props.actor),
    );
  };

  export const find = async <
    Payload extends Prisma.studio_meta_chat_sessionsFindManyArgs,
  >(props: {
    payload: Payload;
    actor: IHubActorEntity | null;
    id: string;
    readonly: boolean;
    checkDeletion?: boolean;
  }): Promise<Prisma.studio_meta_chat_sessionsGetPayload<Payload>> => {
    const record =
      await HubGlobal.prisma.studio_meta_chat_sessions.findFirstOrThrow({
        ...props.payload,
        where: {
          id: props.id,
          ...(props.actor === null
            ? undefined
            : props.actor.type === "customer"
              ? {
                  customer: HubCustomerProvider.where(props.actor),
                }
              : props.readonly && props.actor.type === "administrator"
                ? undefined
                : {
                    member: { id: props.actor.member.id },
                  }),
          deleted_at: props.checkDeletion ? null : undefined,
          ...props.payload.where,
        },
      });
    return record as Prisma.studio_meta_chat_sessionsGetPayload<Payload>;
  };

  const search = (input: IStudioMetaChatSession.IRequest.ISearch | undefined) =>
    [
      ...(input?.from ? [{ created_at: { gte: new Date(input.from) } }] : []),
      ...(input?.to ? [{ created_at: { lte: new Date(input.to) } }] : []),
    ] satisfies Prisma.studio_meta_chat_sessionsWhereInput["AND"];

  const orderBy = (
    key: IStudioMetaChatSession.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "session.created_at"
      ? {
          created_at: value,
        }
      : {
          updated_at: value,
        }) satisfies Prisma.studio_meta_chat_sessionsOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    customer: IHubCustomer;
    input: IStudioMetaChatSession.ICreate;
    connect: boolean;
  }): Promise<IStudioMetaChatSession> => {
    if (!!props.input.good_ids?.length) {
      const goods = await HubGlobal.prisma.hub_order_goods.findMany({
        where: {
          AND: [
            ...HubOrderGoodProvider.whereInContract(props.customer),
            {
              id: {
                in: props.input.good_ids,
              },
            },
          ],
        },
      });
      if (goods.length !== props.input.good_ids.length)
        throw ErrorProvider.unprocessable({
          code: HubOrderGoodErrorCode.NOT_ON_A_CONTRACT,
          message: "Some goods are not in the contract or not of yours.",
        });
    }
    const record = await HubGlobal.prisma.studio_meta_chat_sessions.create({
      data: {
        id: props.input.id ?? v4(),
        hub_customer_id: props.customer.id,
        hub_member_id: props.customer.member?.id ?? null,
        title: props.input.title ?? null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        pinned_at: null,
        of_goods: !!props.input.good_ids?.length
          ? {
              createMany: {
                data: props.input.good_ids.map(
                  (hub_order_good_id, sequence) => ({
                    id: v4(),
                    hub_order_good_id,
                    sequence,
                  }),
                ),
              },
            }
          : undefined,
        connections: props.connect
          ? {
              create: [
                StudioMetaChatSessionConnectionProvider.collect(props.customer),
              ],
            }
          : undefined,
      },
      ...json.select(props.customer),
    });
    return json.transform(
      record,
      LanguageUtil.getNonNullActorLanguage(props.customer),
    );
  };

  export const update = async (props: {
    customer: IHubCustomer;
    id: string;
    input: IStudioMetaChatSession.IUpdate;
  }): Promise<void> => {
    if (props.input.title === undefined) return;
    await HubGlobal.prisma.studio_meta_chat_sessions.update({
      where: {
        id: props.id,
        customer: HubCustomerProvider.where(props.customer),
        deleted_at: null,
      },
      data: { title: props.input.title },
    });
  };

  export const pin = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<void> => {
    await HubGlobal.prisma.studio_meta_chat_sessions.update({
      where: {
        id: props.id,
        customer: HubCustomerProvider.where(props.customer),
        deleted_at: null,
      },
      data: { pinned_at: new Date() },
    });
  };

  export const unpin = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<void> => {
    await HubGlobal.prisma.studio_meta_chat_sessions.update({
      where: {
        id: props.id,
        customer: HubCustomerProvider.where(props.customer),
        deleted_at: null,
      },
      data: { pinned_at: null },
    });
  };

  export const erase = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<void> => {
    await HubGlobal.prisma.studio_meta_chat_sessions.update({
      where: {
        id: props.id,
        customer: HubCustomerProvider.where(props.customer),
        deleted_at: null,
      },
      data: { deleted_at: new Date() },
    });
  };

  export const eraseAll = async (customer: IHubCustomer): Promise<void> => {
    await HubGlobal.prisma.studio_meta_chat_sessions.updateMany({
      where: {
        customer: HubCustomerProvider.where(customer),
        deleted_at: null,
      },
      data: { deleted_at: new Date() },
    });
  };

  export const fakeDisconnect = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<void> => {
    await find({
      payload: {},
      actor: props.customer,
      id: props.id,
      readonly: false,
      checkDeletion: false,
    });
    await HubGlobal.prisma.studio_meta_chat_session_connections.updateMany({
      where: {
        studio_meta_chat_session_id: props.id,
        disconnected_at: null,
      },
      data: { disconnected_at: new Date() },
    });
  };

  /* -----------------------------------------------------------
    WEBSOCKET API
  ----------------------------------------------------------- */
  export const start = async (props: {
    query: IStudioMetaChatService.IStartQuery;
    acceptor: WebSocketAcceptor<
      IAuthorization,
      IStudioMetaChatService,
      IStudioMetaChatListener
    >;
  }): Promise<void> => {
    const uuid: string = v4();
    if (HubGlobal.testing === false)
      console.log("StudioMetaChatSessionProvider.start() started", uuid);
    const customer: IHubCustomer | null = await (async () => {
      try {
        return await HubCustomerProvider.authorize({
          level: "member",
          request: {
            headers: {
              authorization:
                props.acceptor.header?.authorization ??
                props.acceptor.header?.Authorization,
            },
          },
        });
      } catch {
        return null;
      }
    })();
    if (customer === null) {
      if (HubGlobal.testing === false)
        console.log("StudioMetaChatSessionProvider.start() unauthorized", uuid);
      await props.acceptor.reject(1008, "Unauthorized");
      return;
    }

    const session: IStudioMetaChatSession | Error = await (async () => {
      try {
        return await create({
          customer,
          input: props.query,
          connect: true,
        });
      } catch (error) {
        return error as Error;
      }
    })();
    if (session instanceof Error) {
      await props.acceptor.reject(1006, session.message);
      return;
    } else if (session.connection === null) {
      await props.acceptor.reject(
        1006,
        "No connection record exists. It can't be, unreachable code.",
      );
      return;
    }
    await communicate({
      customer,
      query: props.query,
      acceptor: props.acceptor,
      session,
      connection: session.connection,
      restart: false,
    });
    if (HubGlobal.testing === false)
      console.log("StudioMetaChatSessionProvider.start() completed", uuid);
  };

  export const restart = async (props: {
    id: string;
    query: IStudioMetaChatService.IQuery;
    acceptor: WebSocketAcceptor<
      IAuthorization,
      IStudioMetaChatService,
      IStudioMetaChatListener
    >;
  }): Promise<void> => {
    const uuid: string = v4();
    if (HubGlobal.testing === false)
      console.log("StudioMetaChatSessionProvider.restart() started", uuid);

    const customer: IHubCustomer | null = await (async () => {
      try {
        return await HubCustomerProvider.authorize({
          level: "member",
          request: {
            headers: {
              authorization:
                props.acceptor.header?.authorization ??
                props.acceptor.header?.Authorization,
            },
          },
        });
      } catch {
        return null;
      }
    })();
    if (customer === null) {
      if (HubGlobal.testing === false)
        console.log(
          "StudioMetaChatSessionProvider.restart() unauthorized",
          uuid,
        );
      await props.acceptor.reject(1008, "Unauthorized");
      return;
    }

    const session: IStudioMetaChatSession | null = await (async () => {
      try {
        return await at({
          actor: customer,
          id: props.id,
          readonly: false,
        });
      } catch {
        return null;
      }
    })();
    if (session === null) {
      if (HubGlobal.testing === false)
        console.log("StudioMetaChatSessionProvider.restart() not found", uuid);
      await props.acceptor.reject(1006, "Record not found");
      return;
    }

    const previous =
      await HubGlobal.prisma.studio_meta_chat_session_connections.findFirst({
        where: {
          studio_meta_chat_session_id: session.id,
          disconnected_at: null,
        },
      });
    if (previous !== null) {
      const expected: number =
        new Date(previous.survived_at ?? previous.connected_at).getTime() +
        StudioMetaChatSessionConnectionProvider.PREDICATE;
      if (Date.now() > expected) {
        await HubGlobal.prisma.studio_meta_chat_session_connections.update({
          where: { id: previous.id },
          data: { disconnected_at: new Date(expected) },
        });
      } else {
        if (HubGlobal.testing === false)
          console.log(
            "StudioMetaChatSessionProvider.restart() already connected",
            uuid,
          );
        await props.acceptor.reject(1007, "Session is already connected.");
        return;
      }
    }

    const connection: IStudioMetaChatSessionConnection =
      await StudioMetaChatSessionConnectionProvider.create({
        customer,
        session,
      });
    session.connection = connection;
    await communicate({
      customer,
      query: props.query,
      acceptor: props.acceptor,
      session,
      connection,
      restart: true,
    });
    if (HubGlobal.testing === false)
      console.log("StudioMetaChatSessionProvider.restart() completed", uuid);
  };

  const communicate = async (props: {
    customer: IHubCustomer;
    query: IStudioMetaChatService.IQuery;
    acceptor: WebSocketAcceptor<
      IAuthorization,
      IStudioMetaChatService,
      IStudioMetaChatListener
    >;
    session: IStudioMetaChatSession;
    connection: IStudioMetaChatSessionConnection;
    restart: boolean;
  }): Promise<void> => {
    const listener: IStudioMetaChatListener = new StudioMetaChatListener(
      props.acceptor.getDriver(),
      props.session,
      props.connection,
    );
    const next: IStudioMetaChatServiceProps = {
      customer: props.customer,
      acceptor: props.acceptor,
      listener,
      session: props.session,
      connection: props.connection,
      restart: props.restart,
      timezone: props.query?.timezone,
      controllers: (
        await ArrayUtil.asyncMap(props.session.goods)(async (good) => {
          const unitList: IHubSaleUnit.IInvert[] = good.commodity.sale.units;
          const unitSwaggers: IHubSaleSnapshotUnitSwagger[] =
            await ArrayUtil.asyncMap(unitList)((u) =>
              HubSaleSnapshotUnitSwaggerProvider.at({
                actor: props.session.customer,
                sale: { id: good.commodity.sale.id },
                snapshot: { id: good.commodity.sale.snapshot_id },
                unit: { id: u.id },
              }),
            );
          return unitSwaggers.map((us) => ({
            swagger: us.swagger,
            application: HttpLlm.application({
              model: "chatgpt",
              document: us.swagger,
              options: {
                separate: (schema) =>
                  ChatGptTypeChecker.isString(schema) &&
                  schema["x-wrtn-secret-key"] !== undefined,
              },
            }),
          }));
        })
      ).flat(),
    };
    const service: IStudioMetaChatService =
      HubGlobal.mock || props.query.mock === true
        ? new StudioMetaChatMockService(next)
        : new StudioMetaChatService(next);
    await props.acceptor.accept(service);
    try {
      props.acceptor.ping(10_000);
    } catch {}
    handleConnection(props).catch(() => {});
  };

  const handleConnection = async (props: {
    customer: IHubCustomer;
    session: IStudioMetaChatSession;
    connection: IStudioMetaChatSessionConnection;
    acceptor: WebSocketAcceptor<
      IAuthorization,
      IStudioMetaChatService,
      IStudioMetaChatListener
    >;
  }): Promise<void> => {
    HubGlobal.acceptors.add(props.acceptor);
    let alive: boolean = true as boolean;
    (async () => {
      while (true) {
        await sleep_for(StudioMetaChatSessionConnectionProvider.PREDICATE);
        if (alive === false) break;
        try {
          await StudioMetaChatSessionConnectionProvider.updateSurvived(
            props.connection.id,
          );
        } catch {}
      }
    })().catch(() => {});
    try {
      await props.acceptor.join();
    } catch {
    } finally {
      alive = false;
    }
    await StudioMetaChatSessionConnectionProvider.updateDisconnected(
      props.connection.id,
    );
    HubGlobal.acceptors.delete(props.acceptor);
  };
}
