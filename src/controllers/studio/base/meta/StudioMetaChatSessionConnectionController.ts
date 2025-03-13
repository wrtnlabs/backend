import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioMetaChatSessionConnection } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionConnection";

import { StudioMetaChatSessionConnectionProvider } from "../../../../providers/studio/meta/StudioMetaChatSessionConnectionProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioMetaChatSessionConnectionController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(`studio/${props.path}/meta/chat/sessions/:sessionId/connections`)
  class StudioMetaChatSessionConnectionController {
    /**
     * Retrieve the list of connection information for the Meta LLM chat session.
     *
     * Batch retrieve the Websocket connection information of
     * {@link IHubCustomer customer} for {@link IStudioMetaChatSession chat session}.
     *
     * The returned {@link IStudioMetaChatSessionConnection}s are {@link IPage paging}
     * processed. And depending on how the request information
     * {@link IStudioMetaChatSessionConnection.IRequest} is set,
     * the number of records per page can be limited by
     * {@link IStudioMetaChatSessionConnection.IRequest.limit},
     * {@link IStudioMetaChatSessionConnection.IRequest.search}, or
     * {@link IStudioMetaChatSessionConnection.IRequest.sort sort conditions}
     * can be set arbitrarily.
     *
     * @param sessionId {@link IStudioMetaChatSession.id} of the chat session
     * @param input Page and search request information
     * @returns Paged connection list
     * @author Samchon
     * @tag Meta
     */
    @core.TypedRoute.Patch()
    public async index(
      @props.AuthGuard("member") actor: Actor,
      @core.TypedParam("sessionId") sessionId: string & tags.Format<"uuid">,
      @core.TypedBody() input: IStudioMetaChatSessionConnection.IRequest,
    ): Promise<IPage<IStudioMetaChatSessionConnection>> {
      return StudioMetaChatSessionConnectionProvider.index({
        actor,
        session: { id: sessionId },
        input,
      });
    }

    /**
     * Meta LLM Chat session connection information individual query.
     *
     * {@link IStudioMetaChatSession chat session}
     * {@link IHubCustomer customer}'s Websocket connection information
     * {@link IStudioMetaChatSessionConnection} is individually searched.
     *
     * @param sessionId {@link IStudioMetaChatSession.id} of the chat session belonging to
     * @param id {@link IStudioMetaChatSessionConnection.id} of the target connection
     * @returns Connection details
     * @author Samchon
     * @tag Meta
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard("member") actor: Actor,
      @core.TypedParam("sessionId") sessionId: string & tags.Format<"uuid">,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IStudioMetaChatSessionConnection> {
      return StudioMetaChatSessionConnectionProvider.at({
        actor,
        session: { id: sessionId },
        id,
      });
    }
  }
  return StudioMetaChatSessionConnectionController;
}
