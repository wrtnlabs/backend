import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { HubActorErrorCode } from "@wrtnlabs/os-api/lib/constants/hub/HubActorErrorCode";
import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioMetaChatSessionShare } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionShare";

import { HubGlobal } from "../../../HubGlobal";
import { LanguageUtil } from "../../../utils/LanguageUtil";
import { PaginationUtil } from "../../../utils/PaginationUtil";
import { ErrorProvider } from "../../common/ErrorProvider";
import { HubCustomerProvider } from "../../hub/actors/HubCustomerProvider";
import { StudioMetaChatSessionProvider } from "./StudioMetaChatSessionProvider";

export namespace StudioMetaChatSessionShareProvider {
  export namespace json {
    export const transform = async (
      input: Prisma.studio_meta_chat_session_sharesGetPayload<
        ReturnType<typeof select>
      >,
      langCode: IHubCustomer.LanguageType | null,
    ): Promise<IStudioMetaChatSessionShare> => {
      const customer = HubCustomerProvider.json.transform(input.customer);
      return {
        id: input.id,
        customer: HubCustomerProvider.json.transform(input.customer),
        session: await StudioMetaChatSessionProvider.json.transform(
          input.session,
          langCode ?? LanguageUtil.getNonNullActorLanguage(customer),
        ),
        title: input.title,
        message_id: input.studio_meta_chat_session_connection_message_id,
        created_at: input.created_at.toISOString(),
      };
    };
    export const select = (actor: IHubActorEntity | null) =>
      ({
        include: {
          customer: HubCustomerProvider.json.select(),
          session: StudioMetaChatSessionProvider.json.select(actor),
        },
      }) satisfies Prisma.studio_meta_chat_session_sharesFindManyArgs;
  }

  /* -----------------------------------------------------------
    READERS
  ----------------------------------------------------------- */
  export const index = async (props: {
    actor: IHubActorEntity;
    input: IStudioMetaChatSessionShare.IRequest;
  }): Promise<IPage<IStudioMetaChatSessionShare>> => {
    if (props.input.session_id !== null)
      await StudioMetaChatSessionProvider.find({
        payload: {},
        actor: props.actor,
        id: props.input.session_id,
        readonly: true,
      });
    return PaginationUtil.paginate({
      schema: HubGlobal.prisma.studio_meta_chat_session_shares,
      payload: json.select(props.actor),
      transform: (v) =>
        json.transform(v, LanguageUtil.getNonNullActorLanguage(props.actor)),
    })({
      where: {
        AND: [
          {
            customer: HubCustomerProvider.where(props.actor),
            deleted_at: null,
          },
          ...(props.input.session_id
            ? [{ studio_meta_chat_session_id: props.input.session_id }]
            : []),
          ...(props.input.search?.title?.length
            ? [
                {
                  title: {
                    contains: props.input.search.title,
                    mode: "insensitive" as const,
                  },
                },
              ]
            : []),
        ],
      },
      orderBy: props.input.sort?.length
        ? PaginationUtil.orderBy(orderBy)(props.input.sort)
        : [{ created_at: "desc" }],
    } satisfies Prisma.studio_meta_chat_session_sharesFindManyArgs)(
      props.input,
    );
  };

  export const at = async (
    id: string,
  ): Promise<IStudioMetaChatSessionShare> => {
    const record =
      await HubGlobal.prisma.studio_meta_chat_session_shares.findFirstOrThrow({
        where: {
          id,
          deleted_at: null,
        },
        ...json.select(null),
      });
    return json.transform(record, null);
  };

  const orderBy = (
    key: IStudioMetaChatSessionShare.IRequest.SortableColumns,
    value: "asc" | "desc",
  ) =>
    (key === "share.created_at"
      ? { created_at: value }
      : {
          title: value,
        }) satisfies Prisma.studio_meta_chat_session_sharesOrderByWithRelationInput;

  /* -----------------------------------------------------------
    WRITERS
  ----------------------------------------------------------- */
  export const create = async (props: {
    customer: IHubCustomer;
    input: IStudioMetaChatSessionShare.ICreate;
  }): Promise<IStudioMetaChatSessionShare> => {
    if (props.customer.member === null) {
      throw ErrorProvider.forbidden({
        code: HubActorErrorCode.NOT_MEMBER,
        message: "You must be a member to share a session.",
      });
    }
    await StudioMetaChatSessionProvider.find({
      payload: {},
      actor: props.customer,
      id: props.input.session_id,
      readonly: false,
    });
    if (props.input.message_id !== null)
      await HubGlobal.prisma.studio_meta_chat_session_connection_messages.findFirstOrThrow(
        {
          where: {
            id: props.input.message_id,
          },
        },
      );
    const record =
      await HubGlobal.prisma.studio_meta_chat_session_shares.create({
        data: {
          id: v4(),
          hub_customer_id: props.customer.id,
          hub_member_id: props.customer.member.id,
          studio_meta_chat_session_id: props.input.session_id,
          studio_meta_chat_session_connection_message_id:
            props.input.message_id,
          title: props.input.title,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
        ...json.select(props.customer),
      });
    return json.transform(
      record,
      LanguageUtil.getNonNullActorLanguage(props.customer),
    );
  };

  export const update = async (props: {
    customer: IHubCustomer;
    id: string;
    input: IStudioMetaChatSessionShare.IUpdate;
  }): Promise<void> => {
    const share =
      await HubGlobal.prisma.studio_meta_chat_session_shares.findFirstOrThrow({
        where: {
          id: props.id,
          customer: HubCustomerProvider.where(props.customer),
          deleted_at: null,
        },
      });
    if (!props.input.message_id && !props.input.title) return;
    else if (props.input.message_id)
      await HubGlobal.prisma.studio_meta_chat_session_connection_messages.findFirstOrThrow(
        {
          where: {
            id: props.input.message_id,
            connection: {
              studio_meta_chat_session_id: share.studio_meta_chat_session_id,
            },
          },
        },
      );
    await HubGlobal.prisma.studio_meta_chat_session_shares.update({
      where: {
        id: share.id,
      },
      data: {
        title: props.input.title,
        studio_meta_chat_session_connection_message_id: props.input.message_id,
      },
    });
  };

  export const erase = async (props: {
    customer: IHubCustomer;
    id: string;
  }): Promise<void> => {
    const record =
      await HubGlobal.prisma.studio_meta_chat_session_shares.findFirstOrThrow({
        where: {
          id: props.id,
          customer: HubCustomerProvider.where(props.customer),
          deleted_at: null,
        },
      });
    await HubGlobal.prisma.studio_meta_chat_session_shares.update({
      where: {
        id: record.id,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  };
}
