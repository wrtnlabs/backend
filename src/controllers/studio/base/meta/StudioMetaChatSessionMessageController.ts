import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioMetaChatSessionMessage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionMessage";

import { StudioMetaChatSessionMessageProvider } from "../../../../providers/studio/meta/StudioMetaChatSessionMessageProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioMetaChatSessionMessageController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(`studio/${props.path}/meta/chat/sessions/:sessionId/messages`)
  class StudioMetaChatSessionMessageController {
    /**
     * Retrieve the list of chat session messages.
     *
     * Retrieve the list of all {@link IStudioMetaChatSessionMessage messages}
     * that occurred in the {@link IStudioMetaChatSession chat session}.
     *
     * If you want to limit the {@link IStudioMetaChatSessionConnection connection unit}
     * that the message occurred in, set
     * {@link IStudioMetaChatSessionMessage.IRequest.connection_id}.
     *
     * The returned {@link IStudioMetaChatSessionMessage} are {@link IPage paging}
     * processed. And depending on how you set the request information
     * {@link IStudioMetaChatSessionMessage.IRequest}, you can limit the number of
     * records per page {@link IStudioMetaChatSessionMessage.IRequest.limit},
     * {@link IStudioMetaChatSessionMessage.IRequest.search}, or
     * {@link IStudioMetaChatSessionMessage.IRequest.sort sort conditions} arbitrarily.
     *
     * @param sessionId {@link IStudioMetaChatSession.id} of the chat session to which it belongs
     * @param input Page and search request information
     * @returns List of paging messages
     * @author Samchon
     * @tag Meta
     */
    @core.TypedRoute.Patch()
    public async index(
      @props.AuthGuard("member") actor: Actor,
      @core.TypedParam("sessionId") sessionId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IStudioMetaChatSessionMessage.IRequest,
    ): Promise<IPage<IStudioMetaChatSessionMessage>> {
      return StudioMetaChatSessionMessageProvider.index({
        actor,
        session: { id: sessionId },
        input,
      });
    }

    /**
     * Retrieve chat session message details.
     *
     * Retrieve the details of a specific
     * {@link IStudioMetaChatSessionMessage message}
     * that occurred in a {@link IStudioMetaChatSession chat session}.
     *
     * @param sessionId {@link IStudioMetaChatSession.id} of the chat session to which it belongs
     * @param id {@link IStudioMetaChatSessionMessage.id} of the target message
     * @returns message details
     * @author Samchon
     * @tag Meta
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard("member") actor: Actor,
      @core.TypedParam("sessionId") sessionId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IStudioMetaChatSessionMessage> {
      return StudioMetaChatSessionMessageProvider.at({
        actor,
        session: { id: sessionId },
        id,
      });
    }
  }
  return StudioMetaChatSessionMessageController;
}
