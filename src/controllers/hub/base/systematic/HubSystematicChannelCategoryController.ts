import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import typia from "typia";

import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IHubChannelCategory } from "@wrtnlabs/os-api/lib/structures/hub/systematic/IHubChannelCategory";

import { HubChannelCategoryProvider } from "../../../../providers/hub/systematic/HubChannelCategoryProvider";
import { HubChannelProvider } from "../../../../providers/hub/systematic/HubChannelProvider";

import { LanguageUtil } from "../../../../utils/LanguageUtil";
import { IHubControllerProps } from "../IHubControllerProps";

export function HubSystematicChannelCategoryController(
  props: IHubControllerProps,
) {
  @Controller(`hub/${props.path}/systematic/channels/:channelCode/categories`)
  class HubSystematicChannelCategoryController {
    /**
     * List of channel category information.
     *
     * Retrieves the {@link IHubChannelCategory} list.
     *
     * Channel categories have a 1: N recursive structure, and if a parent
     * category exists, the children field contains a list of child categories.
     *
     * @param channelCode Channel code
     * @return Channel category list
     * @author Asher
     * @tag Systematic
     */
    @core.TypedRoute.Patch()
    public async index(
      @props.AuthGuard() actor: IHubActorEntity,
      @core.TypedParam("channelCode") channelCode: string,
    ): Promise<IHubChannelCategory.IHierarchical[]> {
      const langCode = LanguageUtil.getNonNullActorLanguage(actor);
      const channel = await HubChannelProvider.get({
        code: channelCode,
        langCode,
      });
      return HubChannelCategoryProvider.hierarchical.entire({
        channel,
        langCode,
      });
    }

    /**
     * Channel category details.
     *
     * @param channelCode Channel code
     * @param id The channel category {@link IHubChannelCategory.id}
     * @return Channel category details
     * @author Asher
     * @tag Systematic
     */
    @core.TypedRoute.Get(":id")
    public async at(
      @props.AuthGuard() actor: IHubActorEntity,
      @core.TypedParam("channelCode") channelCode: string,
      @core.TypedParam("id") id: string & typia.tags.Format<"uuid">,
    ): Promise<IHubChannelCategory> {
      const langCode = LanguageUtil.getNonNullActorLanguage(actor);
      const channel = await HubChannelProvider.get({
        code: channelCode,
        langCode,
      });
      return HubChannelCategoryProvider.at({
        langCode: langCode,
        channel,
        id,
      });
    }

    /**
     * Parent category information of a specific category.
     *
     * Get parent category information of a specific category.
     *
     * @param channelCode channel code
     * @param id specific category {@link IHubChannelCategory.id}
     * @return parent category information
     * @author Asher
     * @tag Systematic
     */
    @core.TypedRoute.Get(":id/invert")
    public async invert(
      @props.AuthGuard() actor: IHubActorEntity,
      @core.TypedParam("channelCode") channelCode: string,
      @core.TypedParam("id") id: string & typia.tags.Format<"uuid">,
    ): Promise<IHubChannelCategory.IInvert> {
      const langCode = LanguageUtil.getNonNullActorLanguage(actor);
      const channel = await HubChannelProvider.get({
        code: channelCode,
        langCode,
      });
      return HubChannelCategoryProvider.invert({
        langCode,
        channel,
        id,
      });
    }
  }
  return HubSystematicChannelCategoryController;
}
