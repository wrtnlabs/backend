import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioMetaChatServiceDialogue } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatServiceDialogue";
import { IStudioMetaChatSessionMessage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionMessage";
import { IStudioMetaChatSessionMessageOfTalk } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionMessageOfTalk";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { HubCustomerProvider } from "../../hub/actors/HubCustomerProvider";
import { StudioMetaChatSessionProvider } from "./StudioMetaChatSessionProvider";

export namespace StudioMetaChatSessionMessageProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.studio_meta_chat_session_connection_messagesGetPayload<
        ReturnType<typeof select>
      >,
    ): IStudioMetaChatSessionMessage =>
      ({
        id: input.id,
        connection_id: input.studio_meta_chat_session_connection_id,
        speaker: input.speaker as "user" | "agent",
        type: input.type as "talk",
        arguments: decrypt(input.arguments) as [IStudioMetaChatServiceDialogue],
        value: input.value ? decrypt(input.value) : undefined,
        created_at: input.created_at.toISOString(),
        completed_at: input.completed_at?.toISOString() ?? null,
      }) satisfies IStudioMetaChatSessionMessageOfTalk;
    export const select = () =>
      ({}) satisfies Prisma.studio_meta_chat_session_connection_messagesFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor?: IHubActorEntity;
    session: IEntity;
    input: IStudioMetaChatSessionMessage.IRequest;
    where?: Prisma.studio_meta_chat_session_connection_messagesWhereInput;
  }): Promise<IPage<IStudioMetaChatSessionMessage>> => {
    if (props.actor !== undefined)
      await StudioMetaChatSessionProvider.find({
        payload: {},
        actor: props.actor,
        id: props.session.id,
        readonly: true,
      });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_meta_chat_session_connection_messages,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: [
          {
            connection: {
              id: props.input.connection_id ?? undefined,
              studio_meta_chat_session_id: props.session.id,
            },
          },
          ...search(props.input.search),
          ...(props.where ? [props.where] : []),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "asc" }],
    } satisfies Prisma.studio_meta_chat_session_connection_messagesFindManyArgs)(
      props.input,
    );
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    session: IEntity;
    connection?: IEntity;
    id: string;
  }): Promise<IStudioMetaChatSessionMessage> => {
    const record =
      await HubGlobal.prisma.studio_meta_chat_session_connection_messages.findFirstOrThrow(
        {
          where: {
            id: props.id,
            connection: {
              studio_meta_chat_session_id: props.session.id,
              ...(props.actor.type === "administrator"
                ? undefined
                : props.actor.member === null
                  ? HubCustomerProvider.where(props.actor)
                  : { hub_member_id: props.actor.member.id }),
              id: props.connection?.id,
            },
          },
        },
      );
    return json.transform(record);
  };

  const search = (
    input: undefined | IStudioMetaChatSessionMessage.IRequest.ISearch,
  ) =>
    [
      ...(input?.from ? [{ created_at: { gte: new Date(input.from) } }] : []),
      ...(input?.to ? [{ created_at: { lte: new Date(input.to) } }] : []),
    ] satisfies Prisma.studio_meta_chat_session_connection_messagesWhereInput["AND"];

  const orderBy = (
    key: IStudioMetaChatSessionMessage.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "message.created_at"
      ? { created_at: value }
      : {
          completed_at: value,
        }) satisfies Prisma.studio_meta_chat_session_connection_messagesOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    id?: string;
    session: IEntity;
    connection: IEntity;
    speaker: "user" | "agent";
    type: string;
    arguments: any[];
    value: any;
    created_at: Date;
  }): Promise<void> => {
    const message =
      await HubGlobal.prisma.studio_meta_chat_session_connection_messages.create(
        {
          data: {
            id: props.id ?? v4(),
            studio_meta_chat_session_connection_id: props.connection.id,
            speaker: props.speaker,
            type: props.type,
            arguments: encrypt(props.arguments),
            value: props.value ? encrypt(props.value) : undefined,
            created_at: props.created_at,
            completed_at: new Date(),
          },
        },
      );
    if (props.type === "talk")
      await HubGlobal.prisma.mv_studio_meta_chat_session_last_messages.upsert({
        where: { studio_meta_chat_session_id: props.session.id },
        create: {
          studio_meta_chat_session_id: props.session.id,
          studio_meta_chat_session_connection_message_id: message.id,
        },
        update: {
          studio_meta_chat_session_connection_message_id: message.id,
        },
      });

    const updated_at: Date = message.completed_at ?? message.created_at;
    await HubGlobal.prisma.studio_meta_chat_sessions.update({
      where: {
        id: props.session.id,
      },
      data: {
        updated_at,
      },
    });
  };
}
const encrypt = (input: object) =>
  AesPkcs5.encrypt(
    JSON.stringify(input),
    HubGlobal.env.STUDIO_META_CHAT_SESSION_MESSAGE_ENCRYPTION_KEY,
    HubGlobal.env.STUDIO_META_CHAT_SESSION_MESSAGE_ENCRYPTION_IV,
  );
const decrypt = (str: string) =>
  JSON.parse(
    AesPkcs5.decrypt(
      str,
      HubGlobal.env.STUDIO_META_CHAT_SESSION_MESSAGE_ENCRYPTION_KEY,
      HubGlobal.env.STUDIO_META_CHAT_SESSION_MESSAGE_ENCRYPTION_IV,
    ),
  );
