import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import typia from "typia";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { HubChannelProvider } from "../../../../providers/hub/systematic/HubChannelProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubSystematicChannelController(props: IHubControllerProps) {
  @Controller(`hub/${props.path}/systematic/channels`)
  class HubSystematicChannelController {
    /**
     * List of hub channels.
     *
     * Retrieve {@link IHubChannel} list.
     *
     * The returned {@link IHubChannel}s are {@link IPage paging} processed.
     *
     * Depending on how the request information {@link IHubChannel.IRequest} is set,
     * you can {@link IHubChannel.IRequest.limit} limit the number of records per page,
     * {@link IHubChannel.IRequest.search} search for hub channels that satisfy
     * a specific condition, or {@link IHubChannel.IRequest.sort sorting conditions}
     * of `hub_channels` arbitrarily.
     *
     * @param input list request information {@link IHubChannel.IRequest}
     * @returns paging processed {@link IHubChannel} list {@link IPage}
     * @author Asher
     * @tag Systematic
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() _actor: unknown,
      @core.TypedBody() input: IHubChannel.IRequest,
    ): Promise<IPage<IHubChannel>> {
      return HubChannelProvider.index(input);
    }

    /**
     * List of channel hierarchy information.
     *
     * Retrieve {@link IHubChannel.IHierarchical} category hierarchy list.
     *
     * The returned {@link IHubChannel}s are {@link IPage paging} processed.
     * And depending on how the request information {@link IHubChannel.IRequest}
     * is set, you can {@link IHubChannel.IRequest.limit} limit the number of records
     * per page, {@link IHubChannel.IRequest.search} search for channel hierarchies
     * that satisfy a specific condition, or
     * {@link IHubChannel.IRequest.sort sort conditions} of the channel hierarchy
     * arbitrarily.
     *
     * @param input list request information {@link IHubChannel.IRequest}
     * @returns paging processed {@link IHubChannel.IHierarchical} list {@link IPage}
     * @author Asher
     * @tag Systematic
     *
     * @param input
     */
    @core.TypedRoute.Patch("hierarchical")
    public async hierarchical(
      @props.AuthGuard() actor: IHubActorEntity,
      @core.TypedBody() input: IHubChannel.IRequest,
    ): Promise<IPage<IHubChannel.IHierarchical>> {
      return HubChannelProvider.hierarchical({
        actor,
        input,
      });
    }

    /**
     * View the hierarchy of a specific channel by channel ID.
     *
     * Retrieve the hierarchy of a specific channel.
     *
     * @param id {@link IHubChannel.id} to retrieve
     * @return the hierarchy of the specific channel retrieved
     * @author Asher
     * @tag Systematic
     */
    @core.TypedRoute.Get(":id")
    public async at(
      @props.AuthGuard() actor: IHubActorEntity,
      @core.TypedParam("id") id: string & typia.tags.Format<"uuid">,
    ): Promise<IHubChannel.IHierarchical> {
      return HubChannelProvider.at({
        actor,
        id,
      });
    }

    /**
     * View the hierarchy of a specific channel by channel code.
     *
     * Retrieve the hierarchy of a specific channel.
     *
     * @param code {@link IHubChannel.code} to retrieve
     * @return The hierarchy of the specific channel retrieved
     * @author Asher
     * @tag Systematic
     */
    @core.TypedRoute.Get(":code/get")
    public async get(
      @props.AuthGuard() actor: IHubActorEntity,
      @core.TypedParam("code") code: string,
    ): Promise<IHubChannel.IHierarchical> {
      const langCode =
        actor.type === "customer"
          ? actor.lang_code !== null
            ? actor.lang_code
            : "en"
          : "en";
      return HubChannelProvider.get({
        code,
        langCode,
      });
    }
  }
  return HubSystematicChannelController;
}
