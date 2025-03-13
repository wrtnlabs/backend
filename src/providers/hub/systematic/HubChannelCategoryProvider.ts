import { ArrayUtil } from "@nestia/e2e";
import { Prisma } from "@prisma/client";
import {
  IPointer,
  MutableSingleton,
  VariadicMutableSingleton,
  VariadicSingleton,
} from "tstl";
import typia from "typia";
import { v4 } from "uuid";

import { HubSystematicErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubSystematicErrorCode";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IRecordMerge } from "@wrtnlabs/os-api/lib/structures/common/IRecordMerge";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

import { HubGlobal } from "../../../HubGlobal";
import { CacheProvider } from "../../common/CacheProvider";
import { EntityMergeProvider } from "../../common/EntityMergeProvider";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubChannelCategoryNameProvider } from "./HubChannelCategoryNameProvider";

export namespace HubChannelCategoryProvider {
  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export namespace hierarchical {
    export const entire = async (props: {
      channel: IEntity;
      langCode: IHubCustomer.LanguageType;
    }): Promise<IHubChannelCategory.IHierarchical[]> =>
      (await cache.get(props.channel.id, props.langCode).hierarchical())[0];

    export const at = async (props: {
      langCode: IHubCustomer.LanguageType;
      channel: IEntity;
      id: string;
    }): Promise<IHubChannelCategory.IHierarchical> => {
      const record =
        (
          await cache.get(props.channel.id, props.langCode).hierarchical()
        )[1].get(props.id) ?? null;
      if (record === null)
        throw ErrorProvider.notFound({
          code: HubSystematicErrorCode.CATEGORY_NOT_FOUND,
          message: "Unable to find the matched category.",
        });
      return record;
    };
  }

  export const at = async (props: {
    langCode: IHubCustomer.LanguageType;
    channel: IEntity;
    id: string;
  }): Promise<IHubChannelCategory> => {
    const record = await cache
      .get(props.channel.id, props.langCode)
      .at(props.id);
    if (record === null)
      throw ErrorProvider.notFound({
        code: HubSystematicErrorCode.CATEGORY_NOT_FOUND,
        message: "Unable to find the matched category.",
      });
    return record;
  };

  export const invert = async (props: {
    langCode: IHubCustomer.LanguageType;
    channel: IEntity;
    id: string;
  }): Promise<IHubChannelCategory.IInvert> => {
    const record =
      (await cache.get(props.channel.id, props.langCode).invert()).get(
        props.id,
      ) ?? null;
    if (record === null)
      throw ErrorProvider.notFound({
        code: HubSystematicErrorCode.CATEGORY_NOT_FOUND,
        message: "Unable to find the matched category.",
      });
    return record;
  };

  export const search = async (props: {
    langCode: IHubCustomer.LanguageType;
    channel: IEntity;
    ids: string[];
  }): Promise<string[]> => {
    const categories: IHubChannelCategory.IHierarchical[] =
      await ArrayUtil.asyncMap(props.ids)((id) =>
        HubChannelCategoryProvider.hierarchical.at({
          langCode: props.langCode,
          channel: props.channel,
          id,
        }),
      );
    const output: string[] = [];
    const gather = (category: IHubChannelCategory.IHierarchical) => {
      output.push(category.id);
      category.children.forEach(gather);
    };
    categories.forEach(gather);
    return output;
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    admin: IHubAdministrator | null;
    channel: IEntity;
    input: IHubChannelCategory.ICreate;
  }): Promise<IHubChannelCategory.IForAdmin> => {
    const english: string | undefined = props.input.lang_names.find(
      (l) => l.lang_code === "en",
    )?.name;
    if (english === undefined) {
      throw ErrorProvider.badRequest({
        code: HubSystematicErrorCode.CATEGORY_EN_NAME_REQUIRED,
        message: "English name is required to update a category.",
      });
    }

    if (props.input.parent_id !== null)
      await HubGlobal.prisma.hub_channel_categories.findFirstOrThrow({
        where: {
          id: props.input.parent_id,
          hub_channel_id: props.channel.id,
        },
      });
    const record = await HubGlobal.prisma.hub_channel_categories.create({
      data: collect({
        channel: props.channel,
        input: props.input,
        english,
      }),
      include: {
        names: true,
      },
    });
    await CacheProvider.emplace({
      schema: "hub",
      table: "hub_channel_categories",
      key: props.channel.id,
    });
    return {
      ...(await at({
        langCode: "en",
        channel: props.channel,
        id: record.id,
      })),
      name: record.names.map((name) => ({
        id: name.id,
        name: name.name,
        lang_code: name.lang_code,
      })),
    };
  };

  export const update = async (props: {
    admin: IHubAdministrator;
    channel: IEntity;
    id: string;
    input: IHubChannelCategory.IUpdate;
  }): Promise<void> => {
    const record =
      await HubGlobal.prisma.hub_channel_categories.findFirstOrThrow({
        where: {
          hub_channel_id: props.channel.id,
          id: props.id,
        },
        include: {
          names: true,
        },
      });
    if (props.input.parent_id?.length) {
      await HubGlobal.prisma.hub_channel_categories.findFirstOrThrow({
        where: {
          id: props.input.parent_id,
          hub_channel_id: props.channel.id,
        },
      });
    }

    if (
      props.input.lang_names !== undefined &&
      props.input.lang_names.length !== 0
    ) {
      const english: string | undefined = props.input.lang_names.find(
        (l) => l.lang_code === "en",
      )?.name;
      if (english === undefined) {
        throw ErrorProvider.badRequest({
          code: HubSystematicErrorCode.CATEGORY_EN_NAME_REQUIRED,
          message: "English name is required to update a category.",
        });
      }

      for (const langName of props.input.lang_names) {
        await HubGlobal.prisma.hub_channel_category_names.upsert({
          where: {
            lang_code_hub_channel_category_id: {
              lang_code: langName.lang_code,
              hub_channel_category_id: record.id,
            },
          },
          create: {
            ...HubChannelCategoryNameProvider.collect({
              name: langName.name,
              lang_code: langName.lang_code,
            }),
            category: { connect: { id: record.id } },
          },
          update: {
            name: langName.name,
          },
        });
      }
    }

    await HubGlobal.prisma.hub_channel_categories.update({
      where: { id: record.id },
      data: {
        parent_id: props.input.parent_id ?? record.parent_id,
        background_color:
          props.input.background_color ?? record.background_color,
      },
    });
  };

  export const merge = async (props: {
    admin: IHubAdministrator;
    channel: IEntity;
    input: IRecordMerge;
  }) => {
    const categories = await HubGlobal.prisma.hub_channel_categories.findMany({
      where: {
        hub_channel_id: props.channel.id,
        id: {
          in: [props.input.keep, ...props.input.absorbed],
        },
      },
    });
    if (categories.length !== props.input.absorbed.length + 1)
      throw ErrorProvider.notFound({
        accessor: "input.keep | input.absorbed",
        code: HubSystematicErrorCode.CATEGORY_NOT_FOUND,
        message: "Failed to find some categories.",
      });
    await EntityMergeProvider.merge(
      HubGlobal.prisma.hub_channel_categories.fields.id.modelName,
    )(props.input);
  };

  const collect = (props: {
    channel: IEntity;
    input: IHubChannelCategory.ICreate;
    english: string;
  }) =>
    ({
      id: v4(),
      channel: { connect: { id: props.channel.id } },
      parent:
        props.input.parent_id !== null
          ? { connect: { id: props.input.parent_id } }
          : undefined,
      names: {
        createMany: {
          data: props.input.lang_names.map((lang_name) =>
            HubChannelCategoryNameProvider.collect({
              name: lang_name.name,
              lang_code: lang_name.lang_code,
            }),
          ),
        },
      },
      name: props.english,
      background_color: props.input.background_color,
      background_image_url: props.input.background_image_url,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    }) satisfies Prisma.hub_channel_categoriesCreateInput;
}

const cache = new VariadicSingleton(
  (channel_id: string, lang_code: IHubCustomer.LanguageType) => {
    const raw = new MutableSingleton(() =>
      HubGlobal.prisma.hub_channel_categories.findMany({
        where: {
          hub_channel_id: channel_id,
        },
        include: {
          names: {
            select: {
              lang_code: true,
              name: true,
            },
          },
        },
      }),
    );

    const invert = new MutableSingleton(async () => {
      // TRANSFORMATION
      const primitive = await raw.get();
      const elements: IHubChannelCategory.IInvert[] = primitive.map((p) => {
        const name =
          p.names.find((n) => n.lang_code === lang_code)?.name ??
          p.names.find((n) => n.lang_code === "en")?.name ??
          p.names[0]?.name!;
        return {
          ...p,
          name,
          parent: null,
          background_color:
            typia.assert<IHubChannelCategory.BackgroundColor | null>(
              p.background_color,
            ),
          created_at: p.created_at.toISOString(),
        };
      });

      // JOINING
      const dict: Map<string, IHubChannelCategory.IInvert> = new Map();
      for (const elem of elements) dict.set(elem.id, elem);
      for (const elem of elements) {
        if (elem.parent_id === null) continue;
        const parent = dict.get(elem.parent_id)!;
        elem.parent = parent;
      }
      return dict;
    });
    const hierarchical = new MutableSingleton(async () => {
      // TRANSFORMATION
      const primitive = await raw.get();
      const elements: IHubChannelCategory.IHierarchical[] = primitive.map(
        (p) => {
          const name =
            p.names.find((n) => n.lang_code === lang_code)?.name ??
            p.names.find((n) => n.lang_code === "en")?.name ??
            p.names[0]?.name!;
          return {
            id: p.id,
            name,
            background_image_url: p.background_image_url,
            background_color:
              typia.assert<IHubChannelCategory.BackgroundColor | null>(
                p.background_color,
              ),
            parent_id: p.parent_id,
            created_at: p.created_at.toISOString(),
            children: [],
          };
        },
      );

      // JOINING
      const dict: Map<string, IHubChannelCategory.IHierarchical> = new Map();
      const top: IHubChannelCategory.IHierarchical[] = [];

      for (const elem of elements) dict.set(elem.id, elem);
      for (const elem of elements)
        if (elem.parent_id === null) top.push(elem);
        else {
          const parent = dict.get(elem.parent_id)!;
          parent.children.push(elem);
        }
      return [top, dict] as const;
    });
    const detail = new VariadicMutableSingleton(
      async (id: string): Promise<IHubChannelCategory | null> => {
        const up = (await invert.get()).get(id);
        const down = (await hierarchical.get())[1].get(id);
        if (!up || !down) return null;
        return {
          ...down,
          parent: up.parent,
        };
      },
    );

    const time: IPointer<Date> = { value: new Date(0) };
    const checker = async () => {
      const history = await CacheProvider.get({
        schema: "hub",
        table: "hub_channel_categories",
        key: channel_id,
      });
      if (history.getTime() !== time.value.getTime()) {
        time.value = history;
        await raw.clear();
        await invert.clear();
        await hierarchical.clear();
        await detail.clear();
      }
    };
    return {
      hierarchical: async () => {
        await checker();
        return hierarchical.get();
      },
      invert: async () => {
        await checker();
        return invert.get();
      },
      at: async (id: string) => {
        await checker();
        return detail.get(id);
      },
    };
  },
);
