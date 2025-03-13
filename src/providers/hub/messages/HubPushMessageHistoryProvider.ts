import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { Prisma } from "@prisma/client";
import typia, { tags } from "typia";
import { v4 } from "uuid";

import { ICodeEntity } from "@wrtnlabs/os-api/lib/structures/common/ICodeEntity";
import { IEntity } from "@wrtnlabs/os-api/lib/structures/common/IEntity";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IHubPushMessage } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessage";
import { IHubPushMessageHistory } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessageHistory";

import { HubGlobal } from "../../../HubGlobal";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { HubCustomerProvider } from "../actors/HubCustomerProvider";
import { HubPushMessageContentProvider } from "./HubPushMessageContentProvider";
import { HubPushMessageProvider } from "./HubPushMessageProvider";

export namespace HubPushMessageHistoryProvider {
  /* -----------------------------------------------------------
    TRANSFORMERS
  ----------------------------------------------------------- */
  export namespace json {
    export const transform = (
      input: Prisma.hub_push_message_historiesGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubPushMessageHistory => ({
      id: input.id,
      source_id: input.source_id,
      variables: JSON.parse(
        AesPkcs5.decrypt(
          input.variables,
          HubGlobal.env.HUB_PUSH_MESSAGE_HISTORY_ENCRYPTION_KEY,
          HubGlobal.env.HUB_PUSH_MESSAGE_HISTORY_ENCRYPTION_IV,
        ),
      ) as Record<string, string>,
      created_at: input.created_at.toISOString(),
      read_at: input.read_at?.toISOString() ?? null,
      message: {
        id: input.content.message.id,
        code: input.content.message.code,
        source: input.content.message.source,
        target: typia.assert<IHubPushMessage["target"]>(
          input.content.message.target,
        ),
        created_at: input.content.created_at.toISOString(),
        content: HubPushMessageContentProvider.json.transform(input.content),
      },
    });
    export const select = () => ({
      include: {
        content: {
          include: {
            message: HubPushMessageProvider.json.select(),
          },
        },
      },
    });
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    input: IHubPushMessageHistory.IRequest;
  }): Promise<IPage<IHubPushMessageHistory>> => {
    const page: IPage<IHubPushMessageHistory> = await PaginationUtil.paginate({
      schema: HubGlobal.prisma.hub_push_message_histories,
      payload: json.select(),
      transform: json.transform,
    })({
      where: {
        receiver: HubCustomerProvider.where(props.actor),
        content: {
          message: {
            target: props.actor.type,
          },
        },
        AND: search(props.input.search),
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.hub_push_message_historiesFindManyArgs)(props.input);
    for (const history of page.data)
      history.read_at ??= await read({
        actor: props.actor,
        id: history.id,
      });
    return page;
  };

  export const at = async (props: {
    actor: IHubActorEntity;
    id: string;
  }): Promise<IHubPushMessageHistory> => {
    const record =
      await HubGlobal.prisma.hub_push_message_histories.findFirstOrThrow({
        where: {
          id: props.id,
          receiver: HubCustomerProvider.where(props.actor),
          content: {
            message: {
              target: props.actor.type,
            },
          },
        },
        ...json.select(),
      });
    const history: IHubPushMessageHistory = json.transform(record);
    if (history.read_at === null) history.read_at ??= await read(props);
    return history;
  };

  const read = async (props: {
    actor: IHubActorEntity;
    id: string;
  }): Promise<string & tags.Format<"date-time">> => {
    const now: Date = new Date();
    await HubGlobal.prisma.hub_push_message_histories.update({
      where: {
        id: props.id,
      },
      data: {
        hub_customer_reader_id:
          props.actor.type === "customer"
            ? props.actor.id
            : props.actor.customer.id,
        read_at: now,
      },
    });
    return now.toISOString();
  };

  const search = (input: IHubPushMessageHistory.IRequest.ISearch | undefined) =>
    [
      ...(input?.from?.length ? [{ created_at: { gte: input.from } }] : []),
      ...(input?.to?.length ? [{ created_at: { lte: input.to } }] : []),
      ...HubPushMessageProvider.search(input?.message).map((message) => ({
        content: {
          message,
        },
      })),
    ] satisfies Prisma.hub_push_message_historiesWhereInput["AND"];

  const orderBy = (
    key: IHubPushMessageHistory.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "history.created_at"
      ? { created_at: value }
      : {
          read_at: value,
        }) satisfies Prisma.hub_push_message_historiesOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create =
    (customer: IHubCustomer) =>
    async (props: {
      listener: Pick<IHubCustomer, "id" | "type">;
      message: ICodeEntity;
      source: IEntity;
      variables: Record<string, string>;
    }): Promise<IHubPushMessageHistory> => {
      const reference =
        await HubGlobal.prisma.mv_hub_push_message_last_contents.findFirstOrThrow(
          {
            where: {
              message: {
                code: props.message.code,
              },
            },
          },
        );
      const history = await HubGlobal.prisma.hub_push_message_histories.create({
        data: {
          id: v4(),
          hub_push_message_content_id: reference.hub_push_message_content_id,
          source_id: props.source.id,
          hub_customer_receiver_id: customer.id,
          variables: AesPkcs5.encrypt(
            JSON.stringify(props.variables),
            HubGlobal.env.HUB_PUSH_MESSAGE_HISTORY_ENCRYPTION_KEY,
            HubGlobal.env.HUB_PUSH_MESSAGE_HISTORY_ENCRYPTION_IV,
          ),
          created_at: new Date(),
          read_at: null,
        },
        ...json.select(),
      });
      return json.transform(history);
    };
}
