import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";

import { HubGlobal } from "../../../HubGlobal";

export namespace StudioMetaChatSessionStorageProvider {
  export const get = async (props: {
    session: IEntity;
  }): Promise<any | null> => {
    const record =
      await HubGlobal.prisma.studio_meta_chat_session_storages.findFirst({
        select: {
          data: true,
        },
        where: {
          studio_meta_chat_session_id: props.session.id,
        },
      });
    return !!record?.data?.length ? decrypt(record.data) : null;
  };

  export const emplace = async (props: {
    session: IEntity;
    data: any | null;
  }): Promise<void> => {
    if (props.data === null) return;
    const data: string = encrypt(props.data);
    await HubGlobal.prisma.studio_meta_chat_session_storages.upsert({
      where: {
        studio_meta_chat_session_id: props.session.id,
      },
      create: {
        id: v4(),
        studio_meta_chat_session_id: props.session.id,
        data,
      },
      update: {
        data,
      },
    });
  };
}

const decrypt = (str: string) =>
  JSON.parse(
    AesPkcs5.decrypt(
      str,
      HubGlobal.env.STUDIO_META_CHAT_SESSION_STORAGE_ENCRYPTION_KEY,
      HubGlobal.env.STUDIO_META_CHAT_SESSION_STORAGE_ENCRYPTION_IV,
    ),
  );

const encrypt = (data: any) =>
  AesPkcs5.encrypt(
    JSON.stringify(data),
    HubGlobal.env.STUDIO_META_CHAT_SESSION_STORAGE_ENCRYPTION_KEY,
    HubGlobal.env.STUDIO_META_CHAT_SESSION_STORAGE_ENCRYPTION_IV,
  );
