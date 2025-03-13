import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IStudioMetaChatSessionMessage } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSessionMessage";

import { StudioMetaChatSessionShareMessageProvider } from "../../../../providers/studio/meta/StudioMetaChatSessionShareMessageProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioMetaChatSessionShareMessageController(
  props: IHubControllerProps,
) {
  @Controller(
    `/studio/${props.path}/meta/chat/sessions/shares/:shareId/messages`,
  )
  class StudioMetaChatSessionShareMessageController {
    /**
     * Get list of messages in a chat session of shared.
     *
     * @param shareId Target chat session share's {@link IStudioMetaChatSessionShare.id}
     * @param input Page and search request information
     * @returns List of paging messages
     * @author Samchon
     * @tag Meta
     */
    @core.TypedRoute.Patch()
    public index(
      @core.TypedParam("shareId") shareId: string,
      @core.TypedBody() input: IStudioMetaChatSessionMessage.IRequest,
    ): Promise<IPage<IStudioMetaChatSessionMessage>> {
      return StudioMetaChatSessionShareMessageProvider.index({
        share: { id: shareId },
        input,
      });
    }
  }
  return StudioMetaChatSessionShareMessageController;
}
