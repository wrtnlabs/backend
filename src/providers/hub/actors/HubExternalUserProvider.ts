import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IHubExternalUser } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubExternalUser";

import { HubGlobal } from "../../../HubGlobal";
import { BcryptUtil } from "../../../utils/BcryptUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCitizenProvider } from "./HubCitizenProvider";
import { HubExternalUserContentProvider } from "./HubExternalUserContentProvider";

export namespace HubExternalUserProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_external_usersGetPayload<ReturnType<typeof select>>,
    ): IHubExternalUser => {
      HubGlobal.prisma.hub_external_users
        .update({
          where: {
            id: input.id,
          },
          data: {
            application: input.application,
          },
        })
        .catch(() => {});
      return {
        id: input.id,
        citizen:
          input.citizen !== null
            ? HubCitizenProvider.json.transform(input.citizen)
            : null,
        application: input.application,
        uid: input.uid,
        nickname: input.nickname,
        data:
          input.data !== null
            ? JSON.parse(
                AesPkcs5.decrypt(
                  input.data,
                  HubGlobal.env.HUB_EXTERNAL_USER_ENCRYPTION_KEY,
                  HubGlobal.env.HUB_EXTERNAL_USER_ENCRYPTION_IV,
                ),
              )
            : null,
        content:
          input.content !== null
            ? HubExternalUserContentProvider.json.transform(input.content)
            : null,
        member_id: input.member?.id ?? null,
        created_at: input.created_at.toISOString(),
      };
    };
    export const select = () =>
      ({
        include: {
          citizen: HubCitizenProvider.json.select(),
          member: true,
          content: HubExternalUserContentProvider.json.select(),
        },
      }) satisfies Prisma.hub_external_usersFindManyArgs;
  }

  export const emplace = async (props: {
    channel: IEntity;
    customer: IEntity | null;
    input: IHubExternalUser.ICreate;
  }): Promise<IHubExternalUser> => {
    const oldbie = await HubGlobal.prisma.hub_external_users.findFirst({
      where: {
        channel: {
          id: props.channel.id,
        },
        application: props.input.application,
        uid: props.input.uid,
      },
      ...json.select(),
    });
    if (oldbie !== null) {
      if (
        (await BcryptUtil.equals({
          input: props.input.password,
          hashed: oldbie.password,
        })) === false
      )
        throw ErrorProvider.forbidden({
          code: HubActorErrorCode.EXTERNAL_USER_PASSWORD_INCORRECT,
          accessor: "input.password",
          message: "Password of external user is incorrect.",
        });
      if (props.customer !== null) {
        await HubGlobal.prisma.hub_customers.update({
          where: { id: props.customer.id },
          data: {
            hub_external_user_id: oldbie.id,
            hub_citizen_id: oldbie.hub_citizen_id ?? undefined,
            hub_member_id: oldbie.hub_member_id ?? undefined,
          },
        });
      }
      if (props.input.content !== null) {
        if (oldbie.content === null)
          oldbie.content =
            await HubGlobal.prisma.hub_external_user_contents.create({
              data: {
                ...HubExternalUserContentProvider.collect(props.input.content),
                id: v4(),
              },
            });
        else if (
          HubExternalUserContentProvider.equals(
            HubExternalUserContentProvider.json.transform(oldbie.content),
            props.input.content,
          ) === false
        )
          oldbie.content =
            await HubGlobal.prisma.hub_external_user_contents.update({
              where: { id: oldbie.content.id },
              data: {
                jobs: props.input.content.jobs?.toString() ?? null,
                birthYear: props.input.content?.birthYear ?? null,
                gender: props.input.content.gender,
              },
            });
      }
      return json.transform(oldbie);
    }

    const citizen =
      props.input.citizen !== null
        ? await HubCitizenProvider.create({
            channel: props.channel,
            input: props.input.citizen,
          })
        : null;

    const content =
      props.input.content !== null
        ? HubExternalUserContentProvider.collect(props.input.content)
        : undefined;

    const record = await HubGlobal.prisma.hub_external_users.create({
      data: {
        id: v4(),
        channel: {
          connect: { id: props.channel.id },
        },
        citizen:
          citizen !== null
            ? {
                connect: { id: citizen.id },
              }
            : undefined,
        application: props.input.application,
        uid: props.input.uid,
        nickname: props.input.nickname,
        password: await BcryptUtil.hash(props.input.password),
        data: props.input.data
          ? AesPkcs5.encrypt(
              JSON.stringify(props.input.data),
              HubGlobal.env.HUB_EXTERNAL_USER_ENCRYPTION_KEY,
              HubGlobal.env.HUB_EXTERNAL_USER_ENCRYPTION_IV,
            )
          : null,
        content: {
          create: content,
        },
        created_at: new Date(),
      },
      ...json.select(),
    });
    if (props.customer !== null)
      await HubGlobal.prisma.hub_customers.update({
        where: { id: props.customer.id },
        data: {
          hub_external_user_id: record.id,
          hub_citizen_id: citizen?.id ?? undefined,
        },
      });
    return json.transform(record);
  };
}
