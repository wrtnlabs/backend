import core from "@nestia/core";
import { Controller, Patch } from "@nestjs/common";

import { ICheckPrivacy } from "@wrtnlabs/os-api/lib/structures/common/ICheckPrivacy";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";

import { CheckPrivacyProvider } from "../../../../providers/common/CheckPrivacyProvider";

import { IHubControllerProps } from "../IHubControllerProps";

export function HubCommonCheckPrivacyController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  /**
   * Personal information checker.
   *
   * Before registering a sale, check the details, tags, etc. to see if
   * they contain words that could be considered personal information.
   *
   * The check result tells you whether or not they contain words that
   * could be considered personal information, and if so, what words they contain.
   *
   * @param input What to check
   * @returns Check result
   * @author Leo
   * @tag commons
   */
  @Controller(`hub/${props.path}/commons/check/privacy`)
  class HubCommonCheckPrivacyController {
    @Patch()
    async checkPrivacy(
      @props.AuthGuard("member") _actor: Actor,
      @core.TypedBody() input: ICheckPrivacy.IRequest,
    ) {
      return CheckPrivacyProvider.check(input);
    }
  }
  return HubCommonCheckPrivacyController;
}
