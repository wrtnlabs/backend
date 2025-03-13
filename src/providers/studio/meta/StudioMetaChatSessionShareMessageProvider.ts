import { Prisma } from "@prisma/client";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioMetaChatSessionMessage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionMessage";

import { HubGlobal } from "../../../HubGlobal";
import { StudioMetaChatSessionMessageProvider } from "./StudioMetaChatSessionMessageProvider";

export namespace StudioMetaChatSessionShareMessageProvider {
  export const index = async (props: {
    share: IEntity;
    input: IStudioMetaChatSessionMessage.IRequest;
  }): Promise<IPage<IStudioMetaChatSessionMessage>> => {
    const share =
      await HubGlobal.prisma.studio_meta_chat_session_shares.findFirstOrThrow({
        where: {
          id: props.share.id,
          deleted_at: null,
        },
      });
    return StudioMetaChatSessionMessageProvider.index({
      session: { id: share.studio_meta_chat_session_id },
      input: props.input,
      where:
        share.studio_meta_chat_session_connection_message_id !== null
          ? await getWhereEndpoint({
              session: { id: share.studio_meta_chat_session_id },
              message: {
                id: share.studio_meta_chat_session_connection_message_id,
              },
            })
          : undefined,
    });
  };

  const getWhereEndpoint = async (props: {
    session: IEntity;
    message: IEntity;
  }) => {
    const message =
      await HubGlobal.prisma.studio_meta_chat_session_connection_messages.findFirstOrThrow(
        {
          where: {
            id: props.message.id,
            connection: {
              studio_meta_chat_session_id: props.session.id,
            },
          },
        },
      );
    return {
      OR: [
        {
          id: message.id,
        },
        {
          created_at: {
            lt: message.created_at,
          },
        },
      ],
    } satisfies Prisma.studio_meta_chat_session_connection_messagesWhereInput;
  };
}
