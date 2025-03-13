import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubPushMessage } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessage";

import { HubPushMessageProvider } from "../../../../providers/hub/messages/HubPushMessageProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubPushMessageController<Actor extends IHubActorEntity>(
  trait: IHubControllerProps,
) {
  @Controller(`hub/${trait.path}/push-messages`)
  class HubPushMessageController {
    /**
     * Bulk push message query.
     *
     * @param input page request information
     * @returns push message list
     * @author Samchon
     * @tag PushMessage
     */
    @core.TypedRoute.Patch()
    public index(
      @trait.AuthGuard() _actor: Actor,
      @core.TypedBody() input: IHubPushMessage.IRequest,
    ): Promise<IPage<IHubPushMessage>> {
      return HubPushMessageProvider.index(input);
    }

    /**
     * Push message individual query.
     *
     * @param id {@link IHubPushMessage.id} of target push message
     * @returns Push message details
     * @author Samchon
     * @tag PushMessage
     */
    @core.TypedRoute.Get(":id")
    public at(
      @trait.AuthGuard() _actor: Actor,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubPushMessage> {
      return HubPushMessageProvider.at({ id });
    }

    /**
     * Push message individual query by code.
     *
     * @param code {@link IHubPushMessage.code} of target push message
     * @returns Push message details
     * @author Samchon
     * @tag PushMessage
     */
    @core.TypedRoute.Get(":code/get")
    public get(
      @trait.AuthGuard() _actor: Actor,
      @core.TypedParam("code") code: string,
    ): Promise<IHubPushMessage> {
      return HubPushMessageProvider.at({ code });
    }
  }
  return HubPushMessageController;
}
