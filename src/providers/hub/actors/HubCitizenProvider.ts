import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubCitizen } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCitizen";

import { HubGlobal } from "../../../HubGlobal";

export namespace HubCitizenProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_citizensGetPayload<ReturnType<typeof select>>,
    ): IHubCitizen => ({
      id: input.id,
      mobile: AesPkcs5.decrypt(
        input.mobile,
        HubGlobal.env.HUB_CITIZEN_ENCRYPTION_KEY,
        HubGlobal.env.HUB_CITIZEN_ENCRYPTION_IV,
      ),
      name: AesPkcs5.decrypt(
        input.name,
        HubGlobal.env.HUB_CITIZEN_ENCRYPTION_KEY,
        HubGlobal.env.HUB_CITIZEN_ENCRYPTION_IV,
      ),
      created_at: input.created_at.toISOString(),
    });
    export const select = () => ({}) satisfies Prisma.hub_citizensFindManyArgs;
  }

  export const create = async (props: {
    channel: IEntity;
    input: IHubCitizen.ICreate;
  }): Promise<IHubCitizen> => {
    const oldbie = await HubGlobal.prisma.hub_citizens.findFirst({
      where: {
        hub_channel_id: props.channel.id,
        mobile: encrypt(props.input.mobile),
      },
    });
    if (oldbie !== null) return json.transform(oldbie);

    const record = await HubGlobal.prisma.hub_citizens.upsert({
      where: {
        hub_channel_id_mobile: {
          hub_channel_id: props.channel.id,
          mobile: encrypt(props.input.mobile),
        },
      },
      create: {
        id: v4(),
        channel: {
          connect: { id: props.channel.id },
        },
        mobile: encrypt(props.input.mobile),
        name: encrypt(props.input.name),
        created_at: new Date(),
      },
      update: {},
    });
    return json.transform(record);
  };

  export const search = (input: IHubCitizen.IRequest.ISearch | undefined) =>
    [
      ...(input?.mobile?.length ? [{ mobile: encrypt(input.mobile) }] : []),
      ...(input?.name?.length ? [{ name: encrypt(input.name) }] : []),
    ] satisfies Prisma.hub_citizensWhereInput["AND"];

  const encrypt = (str: string): string =>
    AesPkcs5.encrypt(
      str,
      HubGlobal.env.HUB_CITIZEN_ENCRYPTION_KEY,
      HubGlobal.env.HUB_CITIZEN_ENCRYPTION_IV,
    );
}
