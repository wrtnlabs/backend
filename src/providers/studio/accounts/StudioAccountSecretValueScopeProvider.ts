import { ArrayUtil } from "@nestia/e2e";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";

import { HubGlobal } from "../../../HubGlobal";

export namespace StudioAccountSecretValueScopeProvider {
  export const collect = (value: string, sequence: number) => ({
    id: v4(),
    value,
    sequence,
  });

  export const remake = async (props: {
    value: IEntity;
    scopes: string[];
  }): Promise<void> => {
    await HubGlobal.prisma.studio_account_secret_value_scopes.deleteMany({
      where: {
        studio_account_secret_value_id: props.value.id,
      },
    });
    if (props.scopes.length)
      await HubGlobal.prisma.studio_account_secret_value_scopes.createMany({
        data: props.scopes.map((s, i) => ({
          id: v4(),
          studio_account_secret_value_id: props.value.id,
          value: s,
          sequence: i,
        })),
      });
  };

  export const emplace = async (props: {
    value: IEntity;
    scopes: string[];
  }): Promise<void> => {
    const sequence: number =
      ((
        await HubGlobal.prisma.studio_account_secret_value_scopes.findFirst({
          where: {
            studio_account_secret_value_id: props.value.id,
          },
          select: {
            sequence: true,
          },
          orderBy: {
            sequence: "desc",
          },
        })
      )?.sequence ?? -1) + 1;
    await ArrayUtil.asyncMap(props.scopes)(async (s, i) => {
      await HubGlobal.prisma.studio_account_secret_value_scopes.upsert({
        where: {
          studio_account_secret_value_id_value: {
            studio_account_secret_value_id: props.value.id,
            value: s,
          },
        },
        create: {
          ...collect(s, sequence + i),
          studio_account_secret_value_id: props.value.id,
        },
        update: {},
      });
    });
  };
}
