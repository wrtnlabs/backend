import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IRecordMerge } from "@wrtnlabs/os-api/lib/structures/common/IRecordMerge";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { EntityMergeProvider } from "../../common/EntityMergeProvider";
import { HubChannelCategoryProvider } from "./HubChannelCategoryProvider";

export namespace HubChannelProvider {
  /* -----------------------------------------------------------
        TRANSFORMERS
    ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_channelsGetPayload<ReturnType<typeof select>>,
    ): IHubChannel => ({
      id: input.id,
      code: input.code,
      name: input.name,
      created_at: input.created_at.toISOString(),
    });
    export const select = () => ({}) satisfies Prisma.hub_channelsFindManyArgs;
  }

  export const hierarchical = async (props: {
    actor: IHubActorEntity;
    input: IHubChannel.IRequest;
  }): Promise<IPage<IHubChannel.IHierarchical>> => {
    const langCode =
      props.actor.type === "customer"
        ? props.actor.lang_code !== null
          ? props.actor.lang_code
          : "en"
        : "en";
    const page: IPage<IHubChannel> = await index(props.input);
    return {
      ...page,
      data: await ArrayUtil.asyncMap(page.data)(async (channel) => ({
        ...channel,
        categories: await HubChannelCategoryProvider.hierarchical.entire({
          channel,
          langCode,
        }),
      })),
    };
  };

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = (
    input: IHubChannel.IRequest,
  ): Promise<IPage<IHubChannel>> =>
    PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_channels,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        AND: search(input.search),
      },
      orderBy: input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(input.sort)
        : [{ created_at: "asc" }],
    })(input);

  export const search = (input: IHubChannel.IRequest.ISearch | undefined) =>
    [
      ...(input?.code?.length
        ? [
            {
              code: {
                contains: input.code,
              },
            },
          ]
        : []),
      ...(input?.name?.length
        ? [
            {
              name: {
                contains: input.name,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
    ] satisfies Prisma.hub_channelsWhereInput["AND"];

  export const orderBy = (
    key: IHubChannel.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "channel.code"
      ? { code: value }
      : key === "channel.name"
        ? { name: value }
        : {
            created_at: value,
          }) satisfies Prisma.hub_channelsOrderByWithRelationInput;

  export const at = async (props: {
    actor: IHubActorEntity;
    id: string;
  }): Promise<IHubChannel.IHierarchical> => {
    const langCode = LanguageUtil.getNonNullActorLanguage(props.actor);
    const record = await HubGlobal.prisma.hub_channels.findFirstOrThrow({
      where: { id: props.id },
    });
    return {
      ...json.transform(record),
      categories: await HubChannelCategoryProvider.hierarchical.entire({
        channel: record,
        langCode,
      }),
    };
  };

  export const get = async (props: {
    code: string;
    langCode: IHubCustomer.LanguageType;
  }): Promise<IHubChannel.IHierarchical> => {
    const langCode = LanguageUtil.getLangCode(props.langCode);
    const record = await HubGlobal.prisma.hub_channels.findFirstOrThrow({
      where: { code: props.code },
    });
    return {
      ...json.transform(record),
      categories: await HubChannelCategoryProvider.hierarchical.entire({
        channel: record,
        langCode,
      }),
    };
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (
    input: IHubChannel.ICreate,
  ): Promise<IHubChannel> => {
    const record = await HubGlobal.prisma.hub_channels.create({
      data: collect(input),
      ...json.select(),
    });
    return json.transform(record);
  };

  export const update = async (props: {
    id: string;
    input: IHubChannel.IUpdate;
  }): Promise<void> => {
    const record = await HubGlobal.prisma.hub_channels.findFirstOrThrow({
      where: { id: props.id },
    });
    await HubGlobal.prisma.hub_channels.update({
      where: { id: record.id },
      data: {
        name: props.input.name ?? record.name,
      },
    });
  };

  export const destroy = async (id: string): Promise<void> => {
    await HubGlobal.prisma.hub_channels.delete({
      where: { id },
    });
  };

  export const merge = (input: IRecordMerge) =>
    EntityMergeProvider.merge(
      HubGlobal.prisma.hub_channels.fields.id.modelName,
    )(input);

  const collect = (input: IHubChannel.ICreate) =>
    ({
      id: v4(),
      code: input.code,
      name: input.name,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    }) satisfies Prisma.hub_channelsCreateInput;
}
