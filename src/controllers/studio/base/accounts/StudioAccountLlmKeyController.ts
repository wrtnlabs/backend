import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IPage } from "@wrtnlabs/os-api/lib/structures/common/IPage";
import { IHubActorEntity } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubActorEntity";
import { IStudioAccountLlmKey } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountLlmKey";

import { StudioAccountLlmKeyProvider } from "../../../../providers/studio/accounts/StudioAccountLlmKeyProvider";

import { IHubControllerProps } from "../../../hub/base/IHubControllerProps";

export function StudioAccountLlmKeyController<Actor extends IHubActorEntity>(
  props: IHubControllerProps,
) {
  @Controller(`studio/${props.path}/accounts/:accountCode/llm/keys`)
  abstract class StudioAccountLlmKeyController {
    /**
     * Retrieves a list of LLM keys.
     *
     * All {@link IStudioAccountLlmKey LLM key information} records set in
     * {@link IStudioAccount studio account} are retrieved by {@link IPage paging}.
     *
     * Note that the LLM key information records set in a studio account can only
     * be retrieved by {@link IStudioEnterpriseEmployee employees} who have at
     * least membership title, or directly owner of the account.
     *
     * @param accountCode {@link IStudioAccount.code} of the account
     * @param input Page and search request information
     * @returns LLM key information list
     * @author Samchon
     * @tag Account
     */
    @core.TypedRoute.Patch()
    public index(
      @props.AuthGuard() actor: Actor,
      @core.TypedParam("accountCode") accountCode: string,
      @core.TypedBody() input: IStudioAccountLlmKey.IRequest,
    ): Promise<IPage<IStudioAccountLlmKey>> {
      return StudioAccountLlmKeyProvider.index({
        actor,
        account: { code: accountCode },
        input,
      });
    }
  }
  return StudioAccountLlmKeyController;
}
