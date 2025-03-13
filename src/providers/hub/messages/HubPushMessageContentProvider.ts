import { Prisma } from "@prisma/client";
import { v4 } from "uuid";

import { IHubPushMessageContent } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessageContent";

export namespace HubPushMessageContentProvider {
  export namespace json {
    export const transform = (
      input: Prisma.hub_push_message_contentsGetPayload<
        ReturnType<typeof select>
      >,
    ): IHubPushMessageContent => ({
      id: input.id,
      title: input.title,
      body: input.body,
      created_at: input.created_at.toISOString(),
    });
    export const select = () => ({});
  }

  export const collect = (input: IHubPushMessageContent.ICreate) =>
    ({
      id: v4(),
      title: input.title,
      body: input.body,
      created_at: new Date(),
    }) satisfies Prisma.hub_push_message_contentsCreateWithoutMessageInput;
}
