import core from "@nestia/core";
import { tags } from "typia";

import { IRecordMerge } from "@wrtnlabs/os-api/lib/structures/common/IRecordMerge";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubSection } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubSection";

import { HubSectionProvider } from "../../../../providers/hub/systematic/HubSectionProvider";

import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { HubSystematicSectionController } from "../../base/systematic/HubSystematicSectionController";

export class HubAdminSystematicSectionController extends HubSystematicSectionController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {
  /**
   * Create a section.
   *
   * The administrator creates a section.
   *
   * @param input section creation information
   * @return generated section information
   * @author Asher
   * @tag Systematic
   */
  @core.TypedRoute.Post()
  public create(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedBody() input: IHubSection.ICreate,
  ): Promise<IHubSection> {
    return HubSectionProvider.create(input);
  }

  /**
   * Modify section information.
   *
   * Modify information for a specific section.
   *
   * @param id {@link IHubSection.id} to modify
   * @param input section modification information
   * @return modified section information
   * @author Asher
   * @tag Systematic
   */
  @core.TypedRoute.Put(":id")
  public update(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.TypedBody() input: IHubSection.IUpdate,
  ): Promise<void> {
    return HubSectionProvider.update({
      id,
      input,
    });
  }

  /**
   * Delete a section.
   *
   * There is no concept of deleting a section.
   *
   * Instead, there is a concept of merging sections.
   *
   * If you specify a section to keep and a section to merge, all information
   * in the section to merge will be moved to the section to keep, and the section
   * to merge will be deleted.
   *
   * @param input merge information
   * @return void
   * @author Asher
   * @tag Systematic
   */
  @core.TypedRoute.Delete("merge")
  public merge(
    @HubAdminAuth() _admin: IHubAdministrator.IInvert,
    @core.TypedBody() input: IRecordMerge,
  ): Promise<void> {
    return HubSectionProvider.merge(input);
  }
}
