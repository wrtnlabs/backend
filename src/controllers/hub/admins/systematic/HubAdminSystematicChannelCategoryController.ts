import core from "@nestia/core";

import { IRecordMerge } from "@wrtnlabs/os-api/lib/structures/common/IRecordMerge";
import { IHubAdministrator } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubAdministrator";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

import { HubChannelCategoryProvider } from "../../../../providers/hub/systematic/HubChannelCategoryProvider";
import { HubChannelProvider } from "../../../../providers/hub/systematic/HubChannelProvider";

import { HubAdminAuth } from "../../../../decorators/HubAdminAuth";
import { LanguageUtil } from "../../../../utils/LanguageUtil";
import { HubSystematicChannelCategoryController } from "../../base/systematic/HubSystematicChannelCategoryController";

export class HubAdminSystematicChannelCategoryController extends HubSystematicChannelCategoryController(
  {
    path: "admins",
    AuthGuard: HubAdminAuth,
  },
) {
  /**
   * Create a channel category.
   *
   * The administrator creates a channel category.
   *
   * @param channelCode Channel code
   * @param input Channel category creation information
   * @return Created channel category information
   * @author Asher
   * @tag Systematic
   */
  @core.TypedRoute.Post()
  public async create(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedParam("channelCode") channelCode: string,
    @core.TypedBody() input: IHubChannelCategory.ICreate,
  ): Promise<IHubChannelCategory.IForAdmin> {
    const langCode = LanguageUtil.getNonNullActorLanguage(admin);
    const channel = await HubChannelProvider.get({
      code: channelCode,
      langCode,
    });
    return HubChannelCategoryProvider.create({
      admin,
      channel,
      input,
    });
  }

  /**
   * Modify channel category information.
   *
   * Modify information for a specific category.
   *
   * @param channelCode Channel code
   * @param id {@link IHubChannelCategory.id} to modify
   * @param input Category modification information
   * @return void
   * @author Asher
   * @tag Systematic
   */
  @core.TypedRoute.Put(":id")
  public async update(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedParam("channelCode") channelCode: string,
    @core.TypedParam("id") id: string,
    @core.TypedBody() input: IHubChannelCategory.IUpdate,
  ): Promise<void> {
    const langCode = LanguageUtil.getNonNullActorLanguage(admin);
    const channel = await HubChannelProvider.get({
      code: channelCode,
      langCode,
    });
    await HubChannelCategoryProvider.update({
      admin,
      channel,
      id,
      input,
    });
  }

  /**
   * Delete channel category.
   *
   * There is no concept of deleting a category. Instead, there is a concept
   * of merging categories.
   *
   * If you specify a channel category to keep and a channel category to merge,
   * all information in the channel category to merge will be moved to the
   * channel category to keep, and the channel category to merge will be deleted.
   *
   * @param channelCode channel code
   * @param input merge information
   * @return void
   * @author Asher
   * @tag Systematic
   */
  @core.TypedRoute.Delete("merge")
  public async merge(
    @HubAdminAuth() admin: IHubAdministrator.IInvert,
    @core.TypedParam("channelCode") channelCode: string,
    @core.TypedBody() input: IRecordMerge,
  ): Promise<void> {
    const langCode = LanguageUtil.getNonNullActorLanguage(admin);
    const channel = await HubChannelProvider.get({
      code: channelCode,
      langCode,
    });
    return HubChannelCategoryProvider.merge({
      admin,
      channel,
      input,
    });
  }
}
