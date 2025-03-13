import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubSaleContent } from "@wrtnlabs/os-api/lib/structures/hub/sales/IHubSaleContent";

import { HubGlobal } from "../../../HubGlobal";
import { TranslateService } from "../../../services/TranslateService";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { AttachmentFileProvider } from "../../common/AttachmentFileProvider";

export namespace HubSaleSnapshotContentProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_sale_snapshot_contentsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleContent => ({
      id: input.id,
      lang_code: input.lang_code,
      original: input.original,
      title: input.title,
      format: input.format as "txt",
      body: input.body,
      thumbnails: input.to_thumbnails
        .sort((a, b) => a.sequence - b.sequence)
        .map((m) => AttachmentFileProvider.json.transform(m.file)),
      icons: input.to_icons
        .sort((a, b) => a.sequence - b.sequence)
        .map((m) => AttachmentFileProvider.json.transform(m.file)),
      files: input.to_files
        .sort((a, b) => a.sequence - b.sequence)
        .map((m) => AttachmentFileProvider.json.transform(m.file)),
      summary: input.summary,
      version_description: input.version_description,
      tags: input.tags
        .sort((a, b) => a.sequence - b.sequence)
        .map((t) => t.value),
    });
    export const select = () =>
      ({
        include: {
          to_files: {
            include: {
              file: AttachmentFileProvider.json.select(),
            },
          },
          to_thumbnails: {
            include: {
              file: AttachmentFileProvider.json.select(),
            },
          },
          to_icons: {
            include: {
              file: AttachmentFileProvider.json.select(),
            },
          },
          tags: true,
        },
      }) satisfies Prisma.hub_sale_snapshot_contentsFindManyArgs;
  }

  export namespace summary {
    export const transform = (
      input: Prisma.hub_sale_snapshot_contentsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubSaleContent.ISummary => ({
      id: input.id,
      lang_code: input.lang_code,
      original: input.original,
      title: input.title,
      summary: input.summary,
      version_description: input.version_description,
      tags: input.tags
        .sort((a, b) => a.sequence - b.sequence)
        .map((t) => t.value),
      icons: input.to_icons
        .sort((a, b) => a.sequence - b.sequence)
        .map((m) => AttachmentFileProvider.json.transform(m.file)),
    });
    export const select = () =>
      ({
        include: {
          to_icons: {
            include: {
              file: AttachmentFileProvider.json.select(),
            },
          },
          tags: true,
        },
      }) satisfies Prisma.hub_sale_snapshot_contentsFindManyArgs;
  }

  export const selectWithWhere = <
    Selector extends Prisma.hub_sale_snapshot_contentsFindManyArgs,
  >(
    selector: Selector,
    langCode: string,
  ) =>
    ({
      ...selector,
      where: {
        lang_code: langCode,
      },
    }) satisfies Prisma.hub_sale_snapshot_contentsFindManyArgs;

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    snapshot: IEntity | null;
    input: IPage.IRequest;
  }): Promise<IPage<IHubSaleContent>> => {
    const snapshot: IEntity = await findSnapshot(props);
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_sale_snapshot_contents,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        hub_sale_snapshot_id: snapshot.id,
      },
      orderBy: [
        {
          lang_code: "asc",
        },
      ],
    } satisfies Prisma.hub_sale_snapshot_contentsFindManyArgs)(props.input);
  };

  export const get = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    snapshot: IEntity | null;
    langCode: string;
  }): Promise<IHubSaleContent> => {
    const snapshot: IEntity = await findSnapshot(props);
    const content =
      await HubGlobal.prisma.hub_sale_snapshot_contents.findFirstOrThrow({
        where: {
          hub_sale_snapshot_id: snapshot.id,
          lang_code: props.langCode,
        },
        ...json.select(),
      });
    return content !== null
      ? json.transform(content)
      : emplace({
          snapshot,
          langCode: props.langCode,
        });
  };

  const findSnapshot = async (props: {
    actor: IHubActorEntity;
    sale: IEntity;
    snapshot: IEntity | null;
  }): Promise<IEntity> => {
    const snapshot = await HubGlobal.prisma.hub_sale_snapshots.findFirstOrThrow(
      {
        where: {
          ...(props.snapshot
            ? { id: props.snapshot.id }
            : props.actor.type !== "seller"
              ? { hub_sale_id: props.sale.id }
              : {}),
          ...(props.actor.type === "customer"
            ? { mv_approved: { isNot: null } }
            : { mv_last: { isNot: null } }),
          ...(props.actor.type === "seller"
            ? {
                sale: {
                  id: props.sale.id,
                  member: {
                    id: props.actor.member.id,
                  },
                },
              }
            : {}),
        },
        select: {
          id: true,
        },
      },
    );
    return snapshot satisfies IEntity;
  };

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const emplace = async (props: {
    snapshot: IEntity;
    langCode: string;
  }): Promise<IHubSaleContent> => {
    const base = json.transform(
      await HubGlobal.prisma.hub_sale_snapshot_contents.findFirstOrThrow({
        where: {
          hub_sale_snapshot_id: props.snapshot.id,
          original: true,
        },
        ...json.select(),
      }),
    );

    const translated = await TranslateService.api.translate({
      target: props.langCode,
      input: {
        title: base.title,
        summary: base.summary,
        body: base.body,
        version_description: base.version_description,
        tags: base.tags,
      },
    });
    const newbie = await HubGlobal.prisma.hub_sale_snapshot_contents.upsert({
      create: {
        ...(await collect({
          ...base,
          ...translated,
        })),
        hub_sale_snapshot_id: props.snapshot.id,
        lang_code: props.langCode,
        original: false,
      },
      update: {},
      where: {
        hub_sale_snapshot_id_lang_code: {
          hub_sale_snapshot_id: props.snapshot.id,
          lang_code: props.langCode,
        },
      },
      ...json.select(),
    });
    return json.transform(newbie);
  };

  export const collect = async (input: IHubSaleContent.ICreate) =>
    ({
      id: v4(),
      lang_code:
        input.lang_code ??
        (await TranslateService.api.detect({
          input: {
            title: input.title,
            summary: input.summary,
            body: input.body,
          },
        })) ??
        "en",
      original: input.original ?? true,
      title: input.title,
      summary: input.summary,
      body: input.body,
      format: input.format,
      version_description: input.version_description,
      tags: {
        create: input.tags.map((t, i) => ({
          id: v4(),
          value: t,
          sequence: i,
        })),
      },
      to_icons: {
        create: input.icons.map((f, i) => ({
          id: v4(),
          file: {
            create: AttachmentFileProvider.collect(f),
          },
          sequence: i,
        })),
      },
      to_thumbnails: {
        create: input.thumbnails.map((f, i) => ({
          id: v4(),
          file: {
            create: AttachmentFileProvider.collect(f),
          },
          sequence: i,
        })),
      },
      to_files: {
        create: input.files.map((f, i) => ({
          id: v4(),
          file: {
            create: AttachmentFileProvider.collect(f),
          },
          sequence: i,
        })),
      },
    }) satisfies Prisma.hub_sale_snapshot_contentsCreateWithoutSnapshotInput;

  export const translate = async (props: {
    langCode: string;
    input: IHubSaleContent.ICreate;
  }): Promise<IHubSaleContent.ICreate> => {
    const translated: Pick<
      IHubSaleContent.ICreate,
      "title" | "summary" | "body" | "version_description" | "tags"
    > = await TranslateService.api.translate({
      target: props.langCode,
      input: {
        title: props.input.title,
        summary: props.input.summary,
        body: props.input.body,
        version_description: props.input.version_description,
        tags: props.input.tags,
      },
    });
    return {
      ...props.input,
      ...translated,
      lang_code: props.langCode,
      original: false,
    };
  };
}
