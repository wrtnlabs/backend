import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioMetaChatSessionShare } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionShare";

import { StudioMetaChatSessionShareProvider } from "../../../../providers/studio/meta/StudioMetaChatSessionShareProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioMetaChatSessionShareController<
  Actor extends IHubActorEntity,
>(props: IHubControllerProps) {
  @Controller(`/studio/${props.path}/meta/chat/sessions/shares`)
  class StudioMetaChatSessionShareController {
    /**
     * Retrieve the chat session share list.
     * 
     * Retrieve the chat session share {@link IStudioMetaChatSessionShare} list.
     * 
     * The returned {@link IStudioMetaChatSessionShare}s are 
     * {@link IPage paging} processed.
     * 
     * And depending on how you set the request information
     * {@link IStudioMetaChatSessionShare.IRequest}, you can limit the number of
     * records per page by {@link IStudioMetaChatSessionShare.IRequest.limit}, 
     * search only sessions that meet a specific condition by
     * {@link IStudioMetaChatSessionShare.IRequest.search}, or arbitrarily specify
     * the {@link IStudioMetaChatSessionShare.IRequest.sort sorting condition} of
     * the sessions.
     
     * @param input Page and search request information
     * @returns List of paging session shares
     * @author Samchon
     * @tag Meta
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard("member") actor: Actor,
      @core.TypedBody() input: IStudioMetaChatSessionShare.IRequest,
    ): Promise<IPage<IStudioMetaChatSessionShare>> {
      return StudioMetaChatSessionShareProvider.index({
        actor,
        input,
      });
    }

    /**
     * View individual chat session shares.
     *
     * View the target chat session share details {@link IStudioMetaChatSessionShare}.
     *
     * @param id ID of the target chat session share
     * @returns Chat session share details
     * @author Samchon
     * @tag Meta
     */
    @core.TypedRoute.Get(":id")
    public at(
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IStudioMetaChatSessionShare> {
      return StudioMetaChatSessionShareProvider.at(id);
    }
  }
  return StudioMetaChatSessionShareController;
}
