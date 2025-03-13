import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubPushMessageHistory } from "@wrtnlabs/os-api/lib/structures/hub/messages/IHubPushMessageHistory";

import { HubPushMessageHistoryProvider } from "../../../../providers/hub/messages/HubPushMessageHistoryProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubPushMessageHistoryController<Actor extends IHubActorEntity>(
  trait: IHubControllerProps,
) {
  @Controller(`hub/${trait.path}/push-messages/histories`)
  class HubPushMessageHistoryController {
    /**
     * Bulk query of push message sending history.
     *
     * @param input page request and search information
     * @return list of push message sending history
     * @author Samchon
     * @tag PushMessage
     */
    @core.TypedRoute.Patch()
    public index(
      @trait.AuthGuard() actor: Actor,
      @core.TypedBody() input: IHubPushMessageHistory.IRequest,
    ): Promise<IPage<IHubPushMessageHistory>> {
      return HubPushMessageHistoryProvider.index({
        actor,
        input,
      });
    }

    /**
     * Individual inquiry of push message sending history.
     *
     * @param id {@link IHubPushMessageHistory.id} of target push message
     *           sending history
     * @returns Push message sending history details
     * @author Samchon
     * @tag PushMessage
     */
    @core.TypedRoute.Get(":id")
    public at(
      @trait.AuthGuard() actor: Actor,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IHubPushMessageHistory> {
      return HubPushMessageHistoryProvider.at({
        actor,
        id,
      });
    }
  }
  return HubPushMessageHistoryController;
}
