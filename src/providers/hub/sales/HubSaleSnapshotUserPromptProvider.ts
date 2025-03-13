import { Prisma } from "@prisma/client";
import { IEntity } from "@samchon/payment-api/lib/structures/common/IEntity";
import { v4 } from "uuid";

import { IHubSaleSnapshot } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleSnapshot";

import { HubGlobal } from "../../../HubGlobal";
import { TranslateService } from "../../../services/TranslateService";

export namespace HubSaleSnapshotUserPromptProvider {
  export namespace json {
    export const select = () =>
      ({
        include: {
          to_translates: true,
        },
      }) satisfies Prisma.hub_sale_snapshot_user_promptsFindManyArgs;

    export const transform = async (
      input: Prisma.hub_sale_snapshot_user_promptsGetPayload<
        ReturnType<typeof select>
      >,
    ): Promise<IHubSaleSnapshot.IUserPromptExample> => {
      return {
        value: input.to_translates[0].value,
        icon_url: input.icon_url,
      };
    };
  }

  export const emplace = async (props: {
    langCode: string;
    prompt: IEntity;
  }): Promise<IHubSaleSnapshot.IUserPromptExample> => {
    const record =
      await HubGlobal.prisma.hub_sale_snapshot_user_prompts.findFirst({
        where: {
          id: props.prompt.id,
          to_translates: {
            some: {
              lang_code: props.langCode,
            },
          },
        },
        ...json.select(),
      });
    if (record !== null) return json.transform(record);

    const sourceRecord =
      await HubGlobal.prisma.hub_sale_snapshot_user_prompts.findFirstOrThrow({
        where: {
          id: props.prompt.id,
          to_translates: {
            some: {
              original: true,
            },
          },
        },
        ...json.select(),
      });

    const translatedValue = await TranslateService.api.translate({
      target: props.langCode,
      input: {
        value: sourceRecord.to_translates[0].value,
      },
    });

    await HubGlobal.prisma.hub_sale_snapshot_user_prompt_translates.create({
      data: {
        prompt: {
          connect: {
            id: sourceRecord.id,
          },
        },
        id: v4(),
        value: translatedValue.value,
        original: false,
        lang_code: props.langCode,
      },
    });
    return {
      value: translatedValue.value,
      icon_url: sourceRecord.icon_url,
    };
  };

  export const collect = async (props: {
    prompt: IHubSaleSnapshot.IUserPromptExample;
    sequence: number;
  }) => {
    const langCode = await TranslateService.api.detect({
      input: {
        value: props.prompt.value,
      },
    });
    return {
      id: v4(),
      icon_url: props.prompt.icon_url,
      sequence: props.sequence,
      to_translates: {
        create: {
          id: v4(),
          value: props.prompt.value,
          lang_code: langCode,
          original: true,
        },
      },
    } satisfies Prisma.hub_sale_snapshot_user_promptsCreateWithoutSnapshotInput;
  };
}
