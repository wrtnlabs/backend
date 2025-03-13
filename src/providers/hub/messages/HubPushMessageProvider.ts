import { Prisma } from "@prisma/client";
import typia from "typia";
import { v4 } from "uuid";

import { ICodeEntity } from "@wrtnlabs/os-api/lib/structures/common/ICodeEntity";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubPushMessage } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessage";
import { IHubPushMessageContent } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessageContent";

import { HubGlobal } from "../../../HubGlobal";
import { CsvUtil } from "../../../utils/CsvUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { HubPushMessageContentProvider } from "./HubPushMessageContentProvider";

export namespace HubPushMessageProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_push_messagesGetPayload<ReturnType<typeof select>>,
    ): IHubPushMessage => ({
      id: input.id,
      code: input.code,
      source: input.source,
      target: typia.assert<IHubPushMessage["target"]>(input.target),
      content: HubPushMessageContentProvider.json.transform(
        input.mv_last!.content,
      ),
      created_at: input.created_at.toISOString(),
    });
    export const select = () =>
      ({
        include: {
          mv_last: {
            include: {
              content: HubPushMessageContentProvider.json.select(),
            },
          },
        },
      }) satisfies Prisma.hub_push_messagesFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = (
    input: IHubPushMessage.IRequest,
  ): Promise<IPage<IHubPushMessage>> =>
    PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_push_messages,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        deleted_at: null,
        AND: searchDetaily(input.search),
      },
      orderBy: input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(input.sort)
        : [{ created_at: "asc" }],
    } satisfies Prisma.hub_push_messagesFindManyArgs)(input);

  export const at = async (
    target: IEntity | ICodeEntity,
  ): Promise<IHubPushMessage> => {
    const record = await HubGlobal.prisma.hub_push_messages.findFirstOrThrow({
      where: {
        id: typia.is<IEntity>(target) ? target.id : undefined,
        code: typia.is<ICodeEntity>(target) ? target.code : undefined,
        deleted_at: null,
      },
      ...json.select(),
    });
    return json.transform(record);
  };

  export const search = (
    input:
      | Pick<IHubPushMessage.IRequest.ISearch, "source" | "code">
      | undefined,
  ) =>
    [
      ...(input?.code?.length ? [{ code: input.code }] : []),
      ...(input?.source?.length ? [{ source: input.source }] : []),
    ] satisfies Prisma.hub_push_messagesWhereInput["AND"];

  const searchDetaily = (input: IHubPushMessage.IRequest.ISearch | undefined) =>
    [
      ...(input?.code?.length ? [{ code: input.code }] : []),
      ...(input?.source?.length ? [{ source: input.source }] : []),
      ...(input?.target ? [{ target: input.target }] : []),
      ...(input?.content?.title?.length
        ? [
            {
              mv_last: {
                content: {
                  title: {
                    contains: input.content.title,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ]
        : []),
      ...(input?.content?.body?.length
        ? [
            {
              mv_last: {
                content: {
                  body: {
                    contains: input.content.body,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ]
        : []),
      ...(input?.content?.title_or_body?.length
        ? [
            {
              mv_last: {
                content: {
                  OR: [
                    {
                      title: {
                        contains: input.content.title_or_body,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      body: {
                        contains: input.content.title_or_body,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                },
              },
            },
          ]
        : []),
    ] satisfies Prisma.hub_push_messagesWhereInput["AND"];

  const orderBy = (
    key: IHubPushMessage.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "message.code"
      ? { code: value }
      : key === "message.source"
        ? { source: value }
        : key === "message.created_at"
          ? { created_at: value }
          : {
              mv_last: {
                content: {
                  title: value,
                },
              },
            }) satisfies Prisma.hub_push_messagesOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const csv = async (props: {
    admin: IHubAdministrator | null;
    file: File;
  }): Promise<void> => {
    const input: IRawPushMessage[] = typia.assert<IRawPushMessage[]>(
      await CsvUtil.parse(
        "code",
        "source",
        "target",
        "title",
        "body",
      )(await props.file.text()),
    );
    const oldbieDict: Map<string, IEntity> = new Map(
      (
        await HubGlobal.prisma.hub_push_messages.findMany({
          select: { id: true, code: true },
        })
      ).map((m) => [m.code, m]),
    );
    for (const raw of input) {
      const oldbie = oldbieDict.get(raw.code);
      if (oldbie === undefined)
        await create({
          admin: props.admin,
          input: {
            code: raw.code,
            source: raw.source,
            target: raw.target,
            content: {
              title: raw.title,
              body: raw.body,
            },
          },
        });
      else
        await update({
          admin: props.admin,
          id: oldbie.id,
          input: raw,
        });
    }
  };

  export const create = async (props: {
    admin: IHubAdministrator | null;
    input: IHubPushMessage.ICreate;
  }): Promise<IHubPushMessage> => {
    const content = HubPushMessageContentProvider.collect(props.input.content);
    const record = await HubGlobal.prisma.hub_push_messages.create({
      data: {
        id: v4(),
        code: props.input.code,
        source: props.input.source,
        target: props.input.target,
        contents: {
          create: [content],
        },
        mv_last: {
          create: {
            hub_push_message_content_id: content.id,
          },
        },
        created_at: new Date(),
        deleted_at: null,
      },
      ...json.select(),
    });
    return json.transform(record);
  };

  export const update = async (props: {
    admin: IHubAdministrator | null;
    id: string;
    input: IHubPushMessageContent.ICreate;
  }): Promise<IHubPushMessageContent> => {
    const message = await HubGlobal.prisma.hub_push_messages.findFirstOrThrow({
      where: {
        id: props.id,
        deleted_at: null,
      },
    });
    const content = await HubGlobal.prisma.hub_push_message_contents.create({
      data: {
        id: v4(),
        hub_push_message_id: message.id,
        title: props.input.title,
        body: props.input.body,
        created_at: new Date(),
      },
    });
    await HubGlobal.prisma.mv_hub_push_message_last_contents.update({
      where: {
        hub_push_message_id: message.id,
      },
      data: {
        hub_push_message_content_id: content.id,
      },
    });
    return HubPushMessageContentProvider.json.transform(content);
  };

  export const erase = async (props: {
    admin: IHubAdministrator;
    id: string;
  }): Promise<void> => {
    await HubGlobal.prisma.hub_push_messages.update({
      where: {
        id: props.id,
        deleted_at: null,
      },
      data: { deleted_at: new Date() },
    });
  };
}

interface IRawPushMessage {
  code: string;
  source: string;
  target: IHubPushMessage["target"];
  title: string;
  body: string;
}
