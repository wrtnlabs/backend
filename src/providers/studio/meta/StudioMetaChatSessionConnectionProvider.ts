import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioMetaChatSessionConnection } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionConnection";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { HubCustomerProvider } from "../../hub/actors/HubCustomerProvider";
import { StudioMetaChatSessionProvider } from "./StudioMetaChatSessionProvider";

export namespace StudioMetaChatSessionConnectionProvider {
  export const HEALTH_CHECK = 5_000;
  export const PREDICATE = 10_000;

  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.studio_meta_chat_session_connectionsGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioMetaChatSessionConnection => {
      if (input.disconnected_at === null) {
        const expected: number =
          new Date(input.survived_at ?? input.connected_at).getTime() +
          PREDICATE;
        if (Date.now() > expected) {
          input.disconnected_at = new Date(expected);
          HubGlobal.prisma.studio_meta_chat_session_connections
            .update({
              where: { id: input.id },
              data: { disconnected_at: new Date(expected) },
            })
            .catch(() => {});
        }
      }
      return {
        id: input.id,
        customer: HubCustomerProvider.json.transform(input.customer),
        connected_at: input.connected_at.toISOString(),
        disconnected_at: input.disconnected_at?.toISOString() ?? null,
      };
    };
    export const select = () =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
        },
      }) satisfies Prisma.studio_meta_chat_session_connectionsFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    session: IEntity;
    input: IStudioMetaChatSessionConnection.IRequest;
  }): Promise<IPage<IStudioMetaChatSessionConnection>> => {
    await StudioMetaChatSessionProvider.find({
      payload: {},
      actor: props.actor,
      id: props.session.id,
      readonly: true,
    });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_meta_chat_session_connections,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: [
          {
            ...where(props.actor),
            studio_meta_chat_session_id: props.session.id,
          },
          ...search(props.input.search),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ connected_at: "asc" }],
    } satisfies Prisma.studio_meta_chat_session_connectionsFindManyArgs)(
      props.input,
    );
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    session: IEntity;
    id: string;
  }): Promise<IStudioMetaChatSessionConnection> => {
    const record =
      await HubGlobal.prisma.studio_meta_chat_session_connections.findFirstOrThrow(
        {
          where: {
            session: {
              id: props.session.id,
              ...where(props.actor),
              deleted_at: null,
            },
            id: props.id,
          },
          ...json.select(),
        },
      );
    return json.transform(record);
  };

  const where = (actor: IHubActorEntity) =>
    ({
      ...(actor.type === "administrator"
        ? undefined
        : actor.type === "customer"
          ? {
              customer: HubCustomerProvider.where(actor),
            }
          : {
              hub_member_id: actor.member.id,
            }),
    }) satisfies Prisma.studio_meta_chat_session_connectionsWhereInput["AND"];

  const search = (
    input: undefined | IStudioMetaChatSessionConnection.IRequest.ISearch,
  ) =>
    [
      ...(input?.from ? [{ connected_at: { gte: new Date(input.from) } }] : []),
      ...(input?.to ? [{ connected_at: { lte: new Date(input.to) } }] : []),
    ] satisfies Prisma.studio_meta_chat_session_connectionsWhereInput["AND"];

  const orderBy = (
    key: IStudioMetaChatSessionConnection.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "connection.connected_at"
      ? { connected_at: value }
      : {
          disconnected_at: value,
        }) satisfies Prisma.studio_meta_chat_session_connectionsOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    customer: IHubCustomer;
    session: IEntity;
  }): Promise<IStudioMetaChatSessionConnection> => {
    const record =
      await HubGlobal.prisma.studio_meta_chat_session_connections.create({
        data: {
          ...collect(props.customer),
          session: {
            connect: { id: props.session.id },
          },
        },
        ...json.select(),
      });
    return json.transform(record);
  };

  export const collect = (customer: IHubCustomer) =>
    ({
      id: v4(),
      customer: {
        connect: { id: customer.id },
      },
      ...(customer.member === null
        ? undefined
        : {
            member: {
              connect: {
                id: customer.member.id,
              },
            },
          }),
      connected_at: new Date(),
      survived_at: new Date(),
      disconnected_at: null,
    }) satisfies Prisma.studio_meta_chat_session_connectionsCreateWithoutSessionInput;

  export const updateSurvived = async (id: string): Promise<Date> => {
    const time: Date = new Date();
    await HubGlobal.prisma.studio_meta_chat_session_connections.update({
      where: { id },
      data: { survived_at: time },
    });
    return time;
  };

  export const updateDisconnected = async (id: string): Promise<Date> => {
    const time: Date = new Date();
    await HubGlobal.prisma.studio_meta_chat_session_connections.update({
      where: { id },
      data: { disconnected_at: new Date() },
    });
    return time;
  };

  export const fakeDisconnect = async (props: {
    customer: IHubCustomer;
    session: IEntity;
    id: string;
  }): Promise<void> => {
    await StudioMetaChatSessionProvider.find({
      payload: {},
      actor: props.customer,
      id: props.session.id,
      readonly: false,
      checkDeletion: false,
    });
    const record =
      await HubGlobal.prisma.studio_meta_chat_session_connections.findFirst({
        where: {
          studio_meta_chat_session_id: props.session.id,
          id: props.id,
        },
      });
    if (record?.disconnected_at === null) await updateDisconnected(props.id);
  };
}
