import core from "@nestia/core";
import { tags } from "typia";

import { IRecordMerge } from "@wrtnlabs/os-api/lib/structures/common/IRecordMerge";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubChannel } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannel";

import { HubChannelProvider } from "../../../../providers/hub/systematic/HubChannelProvider";

import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSystematicChannelController } from "../../base/systematic/HubSystematicChannelController";

export class HubAdminSystematicChannelController extends HubSystematicChannelController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {
  /**
   * Create a channel.
   *
   * The administrator creates a {@link IHubChannel}.
   *
   * @param input Channel creation information
   * @return Created channel information
   * @author Asher
   * @tag Systematic
   */
  @core.TypedRoute.Post()
  public create(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedBody() input: IHubChannel.ICreate,
  ): Promise<IHubChannel> {
    return HubChannelProvider.create(input);
  }

  /**
   * Modify channel information.
   *
   * Modify information for a specific channel.
   *
   * @param id {@link IHubChannel.id} to modify
   * @param input Modify channel information
   * @return Modified channel information
   * @author Asher
   * @tag Systematic
   */
  @core.TypedRoute.Put(":id")
  public update(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubChannel.IUpdate,
  ): Promise<void> {
    return HubChannelProvider.update({
      id,
      input,
    });
  }

  /**
   * Delete channel.
   *
   * There is no concept of deleting a channel. Instead, there is a concept of
   * merging channels.
   *
   * If you specify a channel to keep and a channel to merge, all information
   * from the channel to be merged will be moved to the channel to be kept,
   * and the channel to be merged will be deleted.
   *
   * @param input merge information
   * @return void
   * @author Asher
   * @tag Systematic
   */
  @core.TypedRoute.Delete("merge")
  public async merge(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedBody() input: IRecordMerge,
  ): Promise<void> {
    return HubChannelProvider.merge(input);
  }
}
