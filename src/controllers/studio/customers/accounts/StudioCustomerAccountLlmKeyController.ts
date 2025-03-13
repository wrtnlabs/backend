import core from "@nestia/core";
import { tags } from "typia";

import { IHubCustomer } from "@wrtnlabs/os-api/lib/structures/hub/actors/IHubCustomer";
import { IStudioAccountLlmKey } from "@wrtnlabs/os-api/lib/structures/studio/actors/IStudioAccountLlmKey";

import { StudioAccountLlmKeyProvider } from "../../../../providers/studio/accounts/StudioAccountLlmKeyProvider";

import { HubCustomerAuth } from "../../../../decorators/HubCustomerAuth";
import { StudioAccountLlmKeyController } from "../../base/accounts/StudioAccountLlmKeyController";

export class StudioCustomerAccountLlmKeyController extends StudioAccountLlmKeyController(
  {
    path: "customers",
    AuthGuard: HubCustomerAuth,
  },
) {
  /**
   * Emplace an LLM API key.
   *
   * Emplace an LLM key information into the studio account. If there's
   * already an LLM key information with the same
   * {@link IStudioAccountLlmKey.code}, its API key value would be overwritten.
   *
   * @param accountCode {@link IStudioAccount.code} of the account
   * @param input LLM key information to emplace
   * @returns Emplaced LLM key information
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Post("emplace")
  public emplace(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedBody() input: IStudioAccountLlmKey.IEmplace,
  ): Promise<IStudioAccountLlmKey> {
    return StudioAccountLlmKeyProvider.emplace({
      customer,
      account: { code: accountCode },
      input,
    });
  }

  /**
   * Erase an LLM API key.
   *
   * Erase an LLM API key from the studio account, so that no more usable.
   *
   * @param accountCode {@link IStudioAccount.code} of the account
   * @param id {@link IStudioAccountLlmKey.id} of the LLM key
   * @author Samchon
   * @tag Account
   */
  @core.TypedRoute.Delete(":id")
  public erase(
    @HubCustomerAuth() customer: IHubCustomer,
    @core.TypedParam("accountCode") accountCode: string,
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
  ): Promise<void> {
    return StudioAccountLlmKeyProvider.erase({
      customer,
      account: { code: accountCode },
      id,
    });
  }
}
