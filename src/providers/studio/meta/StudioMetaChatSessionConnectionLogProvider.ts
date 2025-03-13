import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";

import { HubGlobal } from "../../../HubGlobal";

export namespace StudioMetaChatSessionConnectionLogProvider {
  export const get = async (props: { session: IEntity }) => {
    const records =
      await HubGlobal.prisma.studio_meta_chat_session_connection_logs.findMany({
        select: {
          data: true,
        },
        where: {
          connection: {
            studio_meta_chat_session_id: props.session.id,
          },
        },
        orderBy: {
          created_at: "asc",
        },
      });
    return records.map((x) => decrypt(x.data));
  };

  export const create = async (props: {
    id: string;
    connection: IEntity;
    data: object;
  }): Promise<IEntity> => {
    const entity: IEntity =
      await HubGlobal.prisma.studio_meta_chat_session_connection_logs.create({
        data: {
          id: props.id,
          studio_meta_chat_session_connection_id: props.connection.id,
          data: encrypt(props.data),
          created_at: new Date(),
        },
        select: {
          id: true,
        },
      });
    return entity;
  };

  export const erase = async (props: {
    connection: IEntity;
    logs: IEntity[];
  }): Promise<void> => {
    await HubGlobal.prisma.studio_meta_chat_session_connection_logs.deleteMany({
      where: {
        studio_meta_chat_session_connection_id: props.connection.id,
        id: {
          in: props.logs.map((x) => x.id),
        },
      },
    });
  };

  export const decrypt = (str: string) =>
    JSON.parse(
      AesPkcs5.decrypt(
        str,
        HubGlobal.env.STUDIO_META_CHAT_SESSION_CONNECTION_LOG_ENCRYPTION_KEY,
        HubGlobal.env.STUDIO_META_CHAT_SESSION_CONNECTION_LOG_ENCRYPTION_IV,
      ),
    );
}

const encrypt = (data: object) =>
  AesPkcs5.encrypt(
    JSON.stringify(data),
    HubGlobal.env.STUDIO_META_CHAT_SESSION_CONNECTION_LOG_ENCRYPTION_KEY,
    HubGlobal.env.STUDIO_META_CHAT_SESSION_CONNECTION_LOG_ENCRYPTION_IV,
  );
