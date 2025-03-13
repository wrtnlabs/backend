import core from "@nestia/core";
import { Controller, Get, Res } from "@nestjs/common";
import { FastifyReply } from "fastify";
import { Readable } from "stream";
import { tags } from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioMetaChatSession } from "@wrtnlabs/os-api/lib/structures/studio/meta/IStudioMetaChatSession";

import { StudioMetaChatSessionProvider } from "../../../../providers/studio/meta/StudioMetaChatSessionProvider";
import { StudioMetaChatSessionReportProvider } from "../../../../providers/studio/meta/StudioMetaChatSessionReportProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioMetaChatSessionController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`/studio/${props.path}/meta/chat/sessions`)
  class StudioMetaChatSessionController {
    /**
     * Retrieve the chat session list.
     *
     * Retrieve the chat session {@link IStudioMetaChatSession} list.
     *
     * The returned {@link IStudioMetaChatSession}s are {@link IPage paging} processed.
     *
     * And depending on how you set the request information
     * {@link IStudioMetaChatSession.IRequest}, you can limit the number of
     * records per page by {@link IStudioMetaChatSession.IRequest.limit}, search
     * only sessions that meet a specific condition by
     * {@link IStudioMetaChatSession.IRequest.search}, or arbitrarily specify the
     * {@link IStudioMetaChatSession.IRequest.sort sorting condition} of the
     * sessions.
     *
     * @param input Page and search request information
     * @returns List of paging sessions
     * @author Samchon
     * @tag Meta
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard("member") actor: Actor,
      @core.TypedBody() input: IStudioMetaChatSession.IRequest,
    ): Promise<IPage<IStudioMetaChatSession>> {
      return StudioMetaChatSessionProvider.index({ actor, input });
    }

    /**
     * View individual chat sessions.
     *
     * View the target chat session details {@link IStudioMetaChatSession}.
     *
     * @param id {@link IStudioMetaChatSession.id} of the target chat session
     * @returns Chat session details
     * @author Samchon
     * @tag Meta
     */
    @core.TypedRoute.Get(":id")
    public at(
      @props.AuthGuard("member") actor: Actor,
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
    ): Promise<IStudioMetaChatSession> {
      return StudioMetaChatSessionProvider.at({ actor, id });
    }

    /**
     * @internal
     * @ignore
     */
    @Get(":id/__report.zip")
    public async report(
      @core.TypedParam("id") id: string & tags.Format<"uuid">,
      @Res() res: FastifyReply,
    ): Promise<void> {
      const buffer: Buffer = await StudioMetaChatSessionReportProvider.download(
        {
          session: { id },
        },
      );
      const stream: Readable = Readable.from(buffer);
      res.header("Content-Type", "application/octet-stream");
      res.header(
        "Content-Disposition",
        `attachment; filename=meta.chat.session.${id}.zip`,
      );
      stream.pipe(res.raw);
    }
  }
  return StudioMetaChatSessionController;
}
